import {
  messageForDisplay,
  DEFAULT_ERROR_MESSAGE,
  ERROR_REQUEST_TIMEOUT,
} from '~/utils/errorUtils'

// Use process.env for server-side (Remix actions) and import.meta.env for client-side
// In production builds, Vite env vars need to be available to server code
const API_URL = 
  (typeof process !== 'undefined' && process.env?.VITE_API_URL) ||
  import.meta.env?.VITE_API_URL ||
  ''

if (!API_URL) {
  console.debug('[NetworkService] VITE_API_URL is not set! This will cause API calls to fail.')
}

// Browsers send Origin on mutating requests; Remix loaders/actions use Node fetch,
// which does not. The API CsrfOriginFilter requires Origin or Referer on mutating
// calls, so SSR must supply the public site origin (must match cors.allowed-origins).
const SERVER_SIDE_ORIGIN =
  typeof process !== 'undefined' && typeof window === 'undefined'
    ? process.env?.BASE_URL
    : undefined

export const cacheControlHeader = {
  'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
}

export interface NetworkError extends Error {
  status?: number
  /** When thrown from networkService JSON handling: why we could not use the API body (so callers can log it). */
  responseSummary?: {
    status: number
    statusText: string
    contentType: string
    reason: string
  }
}

/** Options for API requests. timeoutMs aborts the request after that many milliseconds. */
export type RequestOptions = RequestInit & { timeoutMs?: number }

/**
 * Parsed JSON API success: Spring `ApiResponse` payload in `data`, optional user-facing `message`.
 * Callers that only need the entity should use `.data`; use `.message` when the API supplies success copy.
 */
export type ApiResult<T> = {
  data: T
  message?: string
}

// Type guard for NetworkError
export const isNetworkError = (err: unknown): err is NetworkError => {
  return err instanceof Error && 'status' in err
}

/**
 * HTTP status for Remix `data(..., { status })` when a loader/action catches an API error.
 * Uses `status` from a thrown API/network error when it is in the 400–599 range; otherwise `fallbackStatus` (default 500).
 */
export const httpStatusFromNetworkError = (
  error: unknown,
  fallbackStatus: number = 500,
): number => {
  if (!isNetworkError(error)) return fallbackStatus
  const status = error.status
  if (status !== undefined && status >= 400 && status < 600) return status
  return fallbackStatus
}

/**
 * Single entry point for user-facing error messages. Use this in routes/actions
 * when returning error text to the client. API errors (NetworkError) are already
 * sanitized when parsed from error responses so we pass them through; when the API did not
 * return a specific message we use status to show a clearer fallback (check
 * input for 4xx, our problem for 5xx/network).
 *
 * Validation and bad input should come back as 4xx from the API; those hit the
 * 4xx branch below (API message or the caller's fallback). The 5xx branch is only
 * for real server errors: then messageForDisplay uses the caller's fallback
 * (e.g. ERROR_ADD_SURF_SPOT) when the API body is not safe to show.
 */
export function getDisplayMessage(
  error: unknown,
  fallback: string = DEFAULT_ERROR_MESSAGE,
): string {
  if (isNetworkError(error)) {
    const status = error.status
    // status 0 = no response (connection/CORS/network) – never show raw message to user
    if (status === 0) return DEFAULT_ERROR_MESSAGE
    if (status !== undefined) {
      // True server failures only (validation should be 4xx from the API).
      if (status >= 500) return messageForDisplay(error.message, fallback)
      // For 4xx, use API message when present (e.g. validation "Name is required"), else generic
      if (status >= 400 && status < 500) {
        return messageForDisplay(error.message, fallback)
      }
    }
    return messageForDisplay(error.message, fallback)
  }
  const msg = error instanceof Error ? error.message : undefined
  return messageForDisplay(msg, fallback)
}

/** Spring puts the HTTP reason phrase in `error` (e.g. "Not Found"); prefer `message` for the real reason. */
const GENERIC_HTTP_REASON_PHRASES = new Set([
  'bad request',
  'unauthorized',
  'forbidden',
  'not found',
  'method not allowed',
  'not acceptable',
  'conflict',
  'gone',
  'unsupported media type',
  'unprocessable entity',
  'internal server error',
  'bad gateway',
  'service unavailable',
  'gateway timeout',
])

const getMessageFromBody = (data: unknown): string | undefined => {
  if (data == null || typeof data !== 'object') return undefined
  const o = data as Record<string, unknown>
  for (const key of ['message', 'error', 'errorMessage']) {
    const val = o[key]
    if (typeof val !== 'string' || !val.trim()) continue
    const trimmed = val.trim()
    if (key === 'error' && GENERIC_HTTP_REASON_PHRASES.has(trimmed.toLowerCase())) {
      continue
    }
    return trimmed
  }
  return undefined
}

/** Spring `ApiResponse.success` body: unwrap `data` and optional user-facing `message`. */
const extractSuccessPayload = (
  parsedBody: unknown,
): { payload: unknown; message?: string } => {
  if (
    parsedBody &&
    typeof parsedBody === 'object' &&
    'data' in parsedBody &&
    'success' in parsedBody
  ) {
    const envelope = parsedBody as Record<string, unknown>
    const messageValue = envelope.message
    const userMessage =
      typeof messageValue === 'string' && messageValue.trim() !== ''
        ? messageValue.trim()
        : undefined
    return { payload: envelope.data, message: userMessage }
  }
  return { payload: parsedBody }
}

const readJsonApiBodyOrThrow = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get('content-type')
  const isJson = contentType?.includes('application/json')

  let data: unknown = null
  if (isJson) {
    try {
      data = await response.json()
    } catch (parseError) {
      const error = new Error(
        response.ok
          ? 'Failed to parse JSON response'
          : `Request failed with status ${response.status}`,
      ) as NetworkError
      error.status = response.status
      error.responseSummary = {
        status: response.status,
        statusText: response.statusText,
        contentType: contentType ?? 'none',
        reason: 'response.json() threw (body is not valid JSON). parseError=' + (parseError instanceof Error ? parseError.message : String(parseError)),
      }
      throw error
    }
  }

  if (!response.ok) {
    if (data == null) {
      try {
        const text = await response.text()
        const parsed = text ? JSON.parse(text) : null
        if (parsed != null && typeof parsed === 'object') {
          data = parsed
        }
      } catch {
        // ignore: body was not JSON, keep data null
      }
    }
    const bodyMessage = getMessageFromBody(data)
    const errorMessage =
      bodyMessage != null && bodyMessage !== ''
        ? messageForDisplay(bodyMessage, DEFAULT_ERROR_MESSAGE)
        : ''
    const contentTypeHeader = response.headers.get('content-type') ?? 'none'
    const reason =
      bodyMessage
        ? 'using message from body'
        : data == null
          ? 'body not parsed (Content-Type may not be application/json or response was not JSON)'
          : 'body has no message/error/errorMessage field'
    const responseSummary = {
      status: response.status,
      statusText: response.statusText,
      contentType: contentTypeHeader,
      reason,
    }
    // Throw so callers can try/catch. We carry the API's message in error.message (no new wording).
    const error = new Error(errorMessage) as NetworkError
    error.status = response.status
    error.responseSummary = responseSummary
    throw error
  }

  return data
}

const handleResponse = async <T>(response: Response): Promise<ApiResult<T>> => {
  const parsedBody = await readJsonApiBodyOrThrow(response)
  const { payload, message } = extractSuccessPayload(parsedBody)
  return { data: payload as T, message }
}

const performFetch = async <B = undefined>(
  endpoint: string,
  options: RequestOptions = {},
  requestBody?: B,
): Promise<Response> => {
  const isFullUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://')
  const fullUrl = isFullUrl ? endpoint : `${API_URL}/${endpoint}`

  if (!isFullUrl && !API_URL) {
    const error = new Error(DEFAULT_ERROR_MESSAGE) as NetworkError
    error.status = 500
    error.responseSummary = {
      status: 500,
      statusText: 'Config',
      contentType: 'none',
      reason: 'VITE_API_URL is not set (server-side or client env).',
    }
    throw error
  }

  const { timeoutMs, ...fetchInit } = options
  let controller: AbortController | null = null
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  if (timeoutMs != null && timeoutMs > 0) {
    controller = new AbortController()
    timeoutId = setTimeout(() => controller!.abort(), timeoutMs)
    fetchInit.signal = controller.signal
  }

  const headers: HeadersInit = {
    ...(fetchInit.headers as Record<string, string>),
  }
  if (!isFullUrl) {
    (headers as Record<string, string>)['Accept'] = 'application/json'
  }
  const isFileOrBlob = requestBody instanceof File || requestBody instanceof Blob
  if (requestBody && !isFileOrBlob) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json'
  }
  if (
    !isFullUrl &&
    SERVER_SIDE_ORIGIN &&
    !(headers as Record<string, string>)['Origin']
  ) {
    (headers as Record<string, string>)['Origin'] = SERVER_SIDE_ORIGIN
  }

  try {
    const response = await fetch(fullUrl, {
      ...fetchInit,
      // Always include credentials for API requests to send session cookies
      // Only omit for external URLs (like S3 uploads)
      credentials: isFullUrl ? 'omit' : 'include',
      body: requestBody
        ? isFileOrBlob
          ? requestBody
          : JSON.stringify(requestBody)
        : undefined,
      headers,
    })
    if (timeoutId != null) clearTimeout(timeoutId)
    return response
  } catch (fetchError) {
    if (timeoutId != null) clearTimeout(timeoutId)
    if (isNetworkError(fetchError)) {
      throw fetchError
    }
    const isAbort =
      fetchError instanceof Error &&
      (fetchError as Error & { name?: string }).name === 'AbortError'
    // Never surface raw fetch/browser errors (e.g. "fetch failed", "Failed to fetch") to the UI
    const msg = isAbort ? ERROR_REQUEST_TIMEOUT : DEFAULT_ERROR_MESSAGE
    const error = new Error(msg) as NetworkError
    error.status = 0
    error.responseSummary = {
      status: 0,
      statusText: isAbort ? 'Timeout' : 'NoResponse',
      contentType: 'none',
      reason: isAbort
        ? 'request aborted after timeout'
        : 'fetch threw before response (connection refused, DNS, CORS, or network failure). message=' +
          (fetchError instanceof Error ? fetchError.message : String(fetchError)),
    }
    throw error
  }
}

const request = async <T, B = undefined>(
  endpoint: string,
  options: RequestOptions = {},
  body?: B,
): Promise<ApiResult<T>> => {
  const isFullUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://')
  const response = await performFetch(endpoint, options, body)

  // External URLs (like S3) don't return JSON - just check status
  if (isFullUrl) {
    if (!response.ok) {
      const error = new Error(
        `Request failed with status ${response.status} ${response.statusText}`,
      ) as NetworkError
      error.status = response.status
      error.responseSummary = {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type') ?? 'none',
        reason: 'S3 or external URL returned non-OK (not our JSON API).',
      }
      throw error
    }
    return { data: undefined as T }
  }

  return handleResponse<T>(response)
}

// Specific HTTP method functions
export const get = async <T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> => request<T>(endpoint, options)

export const post = async <T, R>(
  endpoint: string,
  body: T,
  options: RequestOptions = {},
): Promise<ApiResult<R>> => request<R, T>(endpoint, { ...options, method: 'POST' }, body)

export const edit = async <T, R = void>(
  endpoint: string,
  body: T,
  options: RequestOptions = {},
): Promise<ApiResult<R>> => request<R, T>(endpoint, { ...options, method: 'PUT' }, body)

export const patch = async <T, R = void>(
  endpoint: string,
  body: T,
  options: RequestOptions = {},
): Promise<ApiResult<R>> => request<R, T>(endpoint, { ...options, method: 'PATCH' }, body)

export const deleteData = async (
  endpoint: string,
  options: RequestOptions = {},
): Promise<ApiResult<void>> => request<void>(endpoint, { ...options, method: 'DELETE' })
