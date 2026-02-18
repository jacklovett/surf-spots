import { messageForDisplay, DEFAULT_ERROR_MESSAGE } from '~/utils/errorUtils'

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
}

// Type guard for NetworkError
export const isNetworkError = (err: unknown): err is NetworkError => {
  return err instanceof Error && 'status' in err
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
      console.error('[NetworkService] Failed to parse JSON response:', {
        status: response.status,
        contentType,
        error: parseError,
      })
      const error = new Error(
        response.ok
          ? 'Failed to parse JSON response'
          : `Request failed with status ${response.status}`,
      ) as NetworkError
      error.status = response.status
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
    if (!bodyMessage) {
      const bodySummary =
        data == null
          ? 'body not parsed (check Content-Type or non-JSON response)'
          : 'body has no message/error/errorMessage field'
      console.error('[NetworkService] API error:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type') ?? 'none',
        reason: bodySummary,
      })
    }
    const error = new Error(errorMessage) as NetworkError
    error.status = response.status
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
        throw error
      }
      return undefined as T
    }

    return handleResponse<T>(response)
  } catch (fetchError) {
    if (isNetworkError(fetchError)) {
      throw fetchError
    }
    const error = new Error(
      fetchError instanceof Error ? fetchError.message : 'Network request failed',
    ) as NetworkError
    error.status = 0
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
