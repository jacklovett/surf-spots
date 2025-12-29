export interface ApiResponse<T> {
  data: T | null
  message: string | null
  status: number
  success: boolean
}

export type FetcherSubmitParams =
  | FormData
  | URLSearchParams
  | Record<string, string>

export interface ActionData {
  error?: string
  submitStatus?: string
  hasError?: boolean
  success?: boolean
}
