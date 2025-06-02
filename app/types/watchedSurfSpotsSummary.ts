import { SurfSpot } from './surfSpots'

type NotificationType = 'promotion' | 'hazard' | 'swell' | 'event'

interface WatchListNotification {
  id: string
  title: string
  description: string
  type: NotificationType
  link?: string
}

interface WatchedSurfSpotsSummary {
  surfSpots: SurfSpot[]
  notifications: WatchListNotification[]
}

export type { WatchedSurfSpotsSummary }
