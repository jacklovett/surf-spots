import type { SurfSessionListItem, SurfSpot } from '~/types/surfSpots'

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
 * Resolves with { success } once the server responds so callers can update UI
 * based on the confirmed result without relying on prop updates.
 */
export type SurfSpotQuickActionSubmitHandler = (
  params: FetcherSubmitParams,
) => Promise<{ success: boolean }>

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
  /** Present when a live session is started. */
  inProgressSession?: SurfSessionListItem
}
