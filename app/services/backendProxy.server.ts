/**
 * TODO(auth-cookie-domain): INTERIM BFF — DELETE THIS FILE when shared-domain
 * session cookies are live. Checklist: surf-spots-api/docs/staging-domain-setup.md
 * (Step 0: remove BFF, point browser networkService at VITE_API_URL, set
 * SESSION_COOKIE_DOMAIN). Do not treat this proxy as the permanent architecture.
 *
 * Remix BFF (Backend For Frontend) for Spring API calls from the browser.
 *
 * Why this exists today:
 * - Remix issues a host-only `session` cookie on the frontend origin (SameSite=Lax).
 * - In production the API is a different host (e.g. Vercel app → Scaleway API).
 * - The browser will NOT send that cookie on cross-site fetch to the API.
 * - Same-origin `/api/backend/*` receives the cookie; this module forwards Cookie
 *   (+ Origin for CSRF) to Spring.
 *
 * Correct future approach (not this file):
 * - app + api under one parent domain
 * - cookie Domain=.parent
 * - browser → API directly; delete this module, api.backend.$.ts, and the
 *   browser rewrite in networkService.
 *
 * Call sites keep using networkService with Spring paths (`countries/...`).
 * Loaders/actions still call Spring directly (they already forward Cookie).
 */

const API_URL =
  (typeof process !== 'undefined' && process.env?.VITE_API_URL) || ''

const SERVER_SIDE_ORIGIN =
  typeof process !== 'undefined' ? process.env?.BASE_URL : undefined

const isUnsafeMethod = (method: string): boolean => {
  const normalized = method.toUpperCase()
  return (
    normalized !== 'GET' &&
    normalized !== 'HEAD' &&
    normalized !== 'OPTIONS'
  )
}

/**
 * Build the Spring target URL for a proxied path + query string.
 * Rejects path traversal and absolute URLs in the splat.
 */
export const buildBackendProxyTargetUrl = (
  splatPath: string | undefined,
  search: string,
  apiBaseUrl: string = API_URL,
): string => {
  if (!apiBaseUrl) {
    throw new Error('VITE_API_URL is not set')
  }

  const trimmed = (splatPath ?? '').replace(/^\/+/, '')
  if (
    trimmed.includes('..') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    throw new Error('Invalid backend proxy path')
  }

  const base = apiBaseUrl.replace(/\/+$/, '')
  const pathSuffix = trimmed ? `/${trimmed}` : ''
  return `${base}${pathSuffix}${search}`
}

export const proxyToBackendApi = async (args: {
  request: Request
  /** Catch-all splat from `api.backend.$` (`params['*']`). */
  splatPath: string | undefined
}): Promise<Response> => {
  const { request, splatPath } = args
  const incomingUrl = new URL(request.url)

  let targetUrl: string
  try {
    targetUrl = buildBackendProxyTargetUrl(splatPath, incomingUrl.search)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Bad proxy request'
    return new Response(message, { status: 400 })
  }

  const headers = new Headers()
  const cookie = request.headers.get('Cookie')
  if (cookie) {
    headers.set('Cookie', cookie)
  }
  const accept = request.headers.get('Accept')
  if (accept) {
    headers.set('Accept', accept)
  }
  const contentType = request.headers.get('Content-Type')
  if (contentType) {
    headers.set('Content-Type', contentType)
  }

  // Spring CsrfOriginFilter needs Origin/Referer on mutating methods.
  const origin =
    request.headers.get('Origin') ||
    request.headers.get('Referer') ||
    SERVER_SIDE_ORIGIN
  if (origin && isUnsafeMethod(request.method)) {
    headers.set('Origin', origin)
  }

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD'
  const upstream = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    redirect: 'manual',
  })

  const responseHeaders = new Headers()
  const upstreamContentType = upstream.headers.get('Content-Type')
  if (upstreamContentType) {
    responseHeaders.set('Content-Type', upstreamContentType)
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  })
}
