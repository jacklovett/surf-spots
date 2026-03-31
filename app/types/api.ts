import type { SurfSpot } from '~/types/surfSpots'

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

export interface SurfSpotActionMeta {
  actionType: string
  target: string
}

export interface ActionData {
  error?: string
  submitStatus?: string
  hasError?: boolean
  success?: boolean
  surfSpotAction?: SurfSpotActionMeta
  /** Present when add/edit surf spot actions return the saved spot. */
  surfSpot?: SurfSpot
}
