import {
  BeachBottomType,
  SkillLevel,
  SurfSpot,
  SurfSpotType,
} from './surfSpots'

export interface SurfedSpotItem {
  surfSpot: SurfSpot
  addedAt: string
  isFavourite: boolean
}

interface SurfedSpotsSummary {
  totalCount: number
  countryCount: number
  continentCount: number
  mostSurfedSpotType: SurfSpotType
  mostSurfedBeachBottomType: BeachBottomType
  skillLevel: SkillLevel
  surfedSpots: SurfedSpotItem[]
}

export type { SurfedSpotsSummary }
