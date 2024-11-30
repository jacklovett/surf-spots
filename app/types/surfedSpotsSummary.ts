import { SurfSpot, SurfSpotType } from './surfSpots'

interface SurfedSpotsSummary {
  totalCount: number
  countryCount: number
  continentCount: number
  mostSurfedSpotType: SurfSpotType
  surfedSpots: SurfSpot[]
}

export type { SurfedSpotsSummary }
