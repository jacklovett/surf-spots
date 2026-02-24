import {
  messageForDisplay,
  DEFAULT_ERROR_MESSAGE,
  ERROR_CHECK_INPUT,
  ERROR_OUR_PROBLEM,
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

export const cacheControlHeader = {
  'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
}

export interface NetworkError extends Error {
  status?: number
  /** When thrown from handleResponse: why we could not use the API body (so callers can log it). */
  responseSummary?: {
    status: number
    statusText: string
    contentType: string
    reason: string
  }
}

// Type guard for NetworkError
export const isNetworkError = (err: unknown): err is NetworkError => {
  return err instanceof Error && 'status' in err
}

/**
 * Single entry point for user-facing error messages. Use this in routes/actions
 * when returning error text to the client. API errors (NetworkError) are already
 * sanitized in handleResponse so we pass them through; when the API did not
 * return a specific message we use status to show a clearer fallback (check
 * input for 4xx, our problem for 5xx/network). Other errors are sanitized once
 * via messageForDisplay.
 */
export function getDisplayMessage(
  error: unknown,
  fallback: string = DEFAULT_ERROR_MESSAGE,
): string {
  if (isNetworkError(error)) {
    const status = error.status
    if (
      status !== undefined &&
      error.message === DEFAULT_ERROR_MESSAGE
    ) {
      if (status >= 400 && status < 500) return ERROR_CHECK_INPUT
      if (status >= 500 || status === 0) return ERROR_OUR_PROBLEM
    }
    return error.message
  }
  const msg = error instanceof Error ? error.message : undefined
  return messageForDisplay(msg, fallback)
}

const getMessageFromBody = (data: unknown): string | undefined => {
  if (data == null || typeof data !== 'object') return undefined
  const o = data as Record<string, unknown>
  for (const key of ['message', 'error', 'errorMessage']) {
    const val = o[key]
    if (typeof val === 'string' && val.trim()) return val.trim()
  }
  return undefined
}

const handleResponse = async <T>(response: Response): Promise<T> => {
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
    const errorMessage = messageForDisplay(bodyMessage, DEFAULT_ERROR_MESSAGE)
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

  // Extract data from API response wrapper if present
  if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
    return data.data as T
  }

  return data as T
}

const request = async <T, B = undefined>(
  endpoint: string,
  options: RequestInit = {},
  body?: B,
): Promise<T> => {
  const isFullUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://')
  const fullUrl = isFullUrl ? endpoint : `${API_URL}/${endpoint}`

  if (!isFullUrl && !API_URL) {
    const error = new Error(
      'VITE_API_URL is not configured. Please set it in your environment variables.',
    ) as NetworkError
    error.status = 500
    throw error
  }

  const headers: HeadersInit = {
    ...(options.headers as Record<string, string>),
  }
  if (!isFullUrl) {
    (headers as Record<string, string>)['Accept'] = 'application/json'
  }
  const isFileOrBlob = body instanceof File || body instanceof Blob
  if (body && !isFileOrBlob) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json'
  }

  try {
    const response = await fetch(fullUrl, {
      ...options,
      // Always include credentials for API requests to send session cookies
      // Only omit for external URLs (like S3 uploads)
      credentials: isFullUrl ? 'omit' : 'include',
      body: body ? (isFileOrBlob ? body : JSON.stringify(body)) : undefined,
      headers,
    })

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
      return undefined as T
    }

    return handleResponse<T>(response)
  } catch (fetchError) {
    if (isNetworkError(fetchError)) {
      throw fetchError
    }
    const msg = fetchError instanceof Error ? fetchError.message : 'Network request failed'
    const error = new Error(msg) as NetworkError
    error.status = 0
    error.responseSummary = {
      status: 0,
      statusText: 'NoResponse',
      contentType: 'none',
      reason: 'fetch threw before response (connection refused, timeout, DNS, CORS, or network failure). message=' + msg,
    }
    throw error
  }
}

// Specific HTTP method functions
export const get = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => request<T>(endpoint, options)

export const post = async <T, R>(
  endpoint: string,
  body: T,
  options: RequestInit = {},
): Promise<R> => request<R, T>(endpoint, { ...options, method: 'POST' }, body)

export const edit = async <T, R = void>(
  endpoint: string,
  body: T,
  options: RequestInit = {},
): Promise<R> => request<R, T>(endpoint, { ...options, method: 'PUT' }, body)

export const deleteData = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<void> => request<void>(endpoint, { ...options, method: 'DELETE' })
