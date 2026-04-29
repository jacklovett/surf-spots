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

/**
 * Watch-list / surfed-spots quick actions submit via Remix fetcher.
 * Must return a Promise so callers (e.g. SurfSpotActions spinners) can await completion.
 */
export type SurfSpotQuickActionSubmitHandler = (
  params: FetcherSubmitParams,
) => Promise<void>

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
