const API_URL = import.meta.env.VITE_API_URL!

export const cacheControlHeader = {
  'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
}

export interface NetworkError extends Error {
  status?: number
}

// Handles the response, throwing an error if the response is not ok
const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json().catch((e) => {
    console.error('Error parsing response JSON:', e)
    return null
  })

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

  const response = await fetch(`${API_URL}/${endpoint}`, {
    ...options,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
    headers,
  })

  return handleResponse<T>(response)
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

export const edit = async <T>(
  endpoint: string,
  body: T,
  options: RequestInit = {},
): Promise<void> =>
  request<void, T>(endpoint, { ...options, method: 'PATCH' }, body)

export const deleteData = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<void> => request<void>(endpoint, { ...options, method: 'DELETE' })
