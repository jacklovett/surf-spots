const API_URL = import.meta.env.VITE_API_URL!

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
): Promise<T | void> => {
  try {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    return handleResponse<T>(response)
  } catch (error) {
    console.error(
      `Error with ${options.method || 'GET'} request to ${endpoint}:`,
      error,
    )
  }
}

// Specific method functions
export const get = async <T>(endpoint: string): Promise<T | void> =>
  request<T>(endpoint)

export const post = async <T, R>(
  endpoint: string,
  body: T,
): Promise<R | void> => request<R, T>(endpoint, { method: 'POST' }, body)

export const edit = async <T>(endpoint: string, body: T): Promise<void> =>
  request<void, T>(endpoint, { method: 'PUT' }, body)

export const deleteData = async (endpoint: string): Promise<void> =>
  request<void>(endpoint, { method: 'DELETE' })
