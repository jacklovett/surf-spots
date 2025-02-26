const API_URL = import.meta.env.VITE_API_URL!

export const cacheControlHeader = {
  'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
}

// Handles the response, throwing an error if the response is not ok
const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const errorMessage =
      data?.message || `Request failed with status ${response.status}`
    throw new Error(errorMessage)
  }
  return data as T
}

const request = async <T, B = undefined>(
  endpoint: string,
  options: RequestInit = {},
  body?: B,
): Promise<T> => {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    // Spread provided options to ensure flexibility for any use case
    ...options,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
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
  request<void, T>(endpoint, { ...options, method: 'PUT' }, body)

export const deleteData = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<void> => request<void>(endpoint, { ...options, method: 'DELETE' })
