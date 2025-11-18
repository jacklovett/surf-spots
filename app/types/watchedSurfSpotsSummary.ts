import { SurfSpot } from './surfSpots'

export type NotificationType = 'promotion' | 'hazard' | 'swell' | 'event'

export interface WatchListNotification {
  id: string
  title: string
  description: string
  type: NotificationType
  link?: string
  imageUrl?: string
  location?: string
  surfSpotName?: string
  createdAt?: string
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
