import {
  BeachBottomType,
  SkillLevel,
  SurfSpot,
  SurfSpotType,
  WaveDirection,
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
  mostSurfedWaveDirection: WaveDirection | null
  skillLevel: SkillLevel
  surfedSpots: SurfedSpotItem[]
}

export type { SurfedSpotsSummary }
