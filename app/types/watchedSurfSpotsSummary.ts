import { SurfSpot } from './surfSpots'

type NotificationType = 'promotion' | 'hazard' | 'swell' | 'event'

interface WatchListNotification {
  id: string
  title: string
  description: string
  type: NotificationType
  link?: string
}

export interface WatchListSpot {
  surfSpot: SurfSpot
  addedAt: string
}

interface WatchedSurfSpotsSummary {
  surfSpots: WatchListSpot[] // Backend returns WatchListSpotDTO[], not SurfSpot[]
  notifications: WatchListNotification[]
}

export type { WatchedSurfSpotsSummary }
