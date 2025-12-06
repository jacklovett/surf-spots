const API_URL = import.meta.env.VITE_API_URL!

// Log API URL in development to help debug production issues
if (import.meta.env.DEV) {
  console.log('[NetworkService] API_URL configured:', API_URL || 'NOT SET')
}

export const cacheControlHeader = {
  'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
}

export interface NetworkError extends Error {
  status?: number
}

// Handles the response, throwing an error if the response is not ok
const handleResponse = async <T>(response: Response): Promise<T> => {
  // Handle empty responses (common with 401/403 errors)
  let data = null
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json()
    } catch (e) {
      // If JSON parsing fails, try to get text
      const text = await response.text().catch(() => '')
      console.warn('[NetworkService] Failed to parse JSON response:', {
        status: response.status,
        contentType,
        text: text.substring(0, 200), // Limit text length
      })
    }
  }

  if (!response.ok) {
    const errorMessage =
      data?.message || `Request failed with status ${response.status}`
    const error = new Error(errorMessage) as NetworkError
    error.status = response.status
    throw error
  }

  // If the response is an ApiResponse, return its data
  if (
    data &&
    'data' in data &&
    'message' in data &&
    'status' in data &&
    'success' in data
  ) {
    return data.data as T
  }

  return data as T
}

const request = async <T, B = undefined>(
  endpoint: string,
  options: RequestInit = {},
  body?: B,
): Promise<T> => {
  // Build headers object, ensuring Content-Type is set correctly
  const headers: HeadersInit = {
    ...(options.headers as Record<string, string>),
  }

  // Set Content-Type for requests with body, ensuring no charset is added
  if (body) {
    headers['Content-Type'] = 'application/json'
  }

  const fullUrl = `${API_URL}/${endpoint}`

  // Log failed requests for debugging (especially in production)
  const response = await fetch(fullUrl, {
    ...options,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
    headers,
  }).catch((fetchError) => {
    console.error('[NetworkService] Fetch error:', {
      url: fullUrl,
      endpoint,
      apiUrl: API_URL,
      error: fetchError,
    })
    throw fetchError
  })

  return handleResponse<T>(response)
}

// Specific HTTP method functions
export const get = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => request<T>(endpoint, options)

// Public GET request without credentials (for public endpoints that don't need auth)
export const getPublic = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const fullUrl = `${API_URL}/${endpoint}`

  const response = await fetch(fullUrl, {
    ...options,
    credentials: 'omit', // Don't send cookies for public endpoints
    headers: options.headers as HeadersInit,
  }).catch((fetchError) => {
    console.error('[NetworkService] Public fetch error:', {
      url: fullUrl,
      endpoint,
      apiUrl: API_URL,
      error: fetchError,
    })
    throw fetchError
  })

  return handleResponse<T>(response)
}

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
