export interface Coordinates {
  longitude: number
  latitude: number
}

export interface BoundingBox {
  minLongitude: number
  minLatitude: number
  maxLongitude: number
  maxLatitude: number
}

export type Continents =
  | 'Africa'
  | 'Asia'
  | 'Oceania'
  | 'Europe'
  | 'North America'
  | 'South America'

export interface Continent {
  id: string
  name: string
  slug: string
  description: string
}

export interface Country {
  id: string
  name: string
  slug: string
  description: string
  regions: []
}

export interface Region {
  id: string
  name: string
  slug: string
  description: string
  surfSpots: []
}

export enum SurfSpotType {
  BeachBreak = 'Beach Break',
  ReefBreak = 'Reef Break',
  PointBreak = 'Point Break',
}

export enum BeachBottomType {
  Sand = 'Sand',
  Rock = 'Rock',
  Reef = 'Reef',
}

export enum SkillLevel {
  Beginner = 'Beginner',
  BeginnerIntermediate = 'Beginner - Intermediate',
  Intermediate = 'Intermediate',
  IntermediateAdvanced = 'Intermediate - Advanced',
  Advanced = 'Advanced',
}

export interface SurfSpot extends NewSurfSpot {
  id: string
  path: string
  isSurfedSpot: boolean
  isFollowing: boolean
}

export interface NewSurfSpot extends Coordinates {
  beachBottomType: BeachBottomType
  country: string
  region: string
  continent: Continents
  name: string
  description: string
  rating: number
  skillLevel: SkillLevel
  type: SurfSpotType
}
