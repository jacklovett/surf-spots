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
  /** Set when add-to-surfed succeeds (flat fields so fetcher JSON always exposes them). */
  addedToSurfedSpots?: boolean
  surfSpotIdForFeedback?: string
  surfSpotNameForFeedback?: string
  /** Present when add/edit surf spot actions return the saved spot. */
  surfSpot?: SurfSpot
}
