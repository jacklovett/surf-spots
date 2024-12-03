import {
  BeachBottomType,
  SkillLevel,
  SurfSpot,
  SurfSpotType,
} from './surfSpots'

interface SurfedSpotsSummary {
  totalCount: number
  countryCount: number
  continentCount: number
  mostSurfedSpotType: SurfSpotType
  mostSurfedBeachBottomType: BeachBottomType
  skillLevel: SkillLevel
  surfedSpots: SurfSpot[]
}

export type { SurfedSpotsSummary }
