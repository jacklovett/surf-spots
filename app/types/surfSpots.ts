import { ForecastLink } from '~/components/ForecastLinks'

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

export enum SurfSpotStatus {
  APPROVED = 'Approved',
  PENDING = 'Pending',
  PRIVATE = 'Private',
}

export enum SurfSpotType {
  BEACH_BREAK = 'Beach Break',
  REEF_BREAK = 'Reef Break',
  POINT_BREAK = 'Point Break',
}

export enum BeachBottomType {
  SAND = 'Sand',
  ROCK = 'Rock',
  REEF = 'Reef',
}

export enum SkillLevel {
  BEGINNER = 'Beginner',
  BEGINNER_INTERMEDIATE = 'Beginner - Intermediate',
  INTERMEDIATE = 'Intermediate',
  INTERMEDIATE_ADVANCED = 'Intermediate - Advanced',
  ADVANCED = 'Advanced',
}

export enum Tide {
  ANY = 'Any',
  LOW = 'Low',
  LOW_MID = 'Low - Mid',
  MID = 'Mid',
  MID_HIGH = 'Mid - High',
  HIGH = 'High',
}

export enum Direction {
  N = 'N',
  NE = 'NE',
  E = 'E',
  SE = 'SE',
  S = 'S',
  SW = 'SW',
  W = 'W',
  NW = 'NW',
}

export interface SurfSpot extends NewSurfSpot {
  id: string
  path: string
  isSurfedSpot: boolean
  isWatched: boolean
  createdBy: string
}

export interface NewSurfSpot extends Coordinates {
  name: string
  description: string
  isPrivate: boolean
  status: SurfSpotStatus
  country?: Country
  region?: Region
  continent?: Continent
  type: SurfSpotType
  beachBottomType: BeachBottomType
  swellDirection: Direction
  windDirection: Direction
  tide: Tide
  minSurfHeight: number
  maxSurfHeight: number
  seasonStart: string
  seasonEnd: string
  skillLevel: SkillLevel
  boatRequired: boolean
  parking: string
  foodNearby: boolean
  foodTypes: string[]
  accommodationNearby: boolean
  accommodationTypes: string[]
  facilities: string[]
  hazards: string[]
  rating: number
  forecasts: string[]
}

export interface SurfSpotFormState {
  continent: string
  country: string
  region: string
  name: string
  type?: SurfSpotType
  beachBottomType?: BeachBottomType
  description: string
  longitude?: number
  latitude?: number
  swellDirection: string
  windDirection: string
  rating?: number
  tide?: Tide
  minSurfHeight?: number
  maxSurfHeight?: number
  seasonStart: string
  seasonEnd: string
  parking: string
  foodNearby: boolean
  skillLevel?: SkillLevel
  forecastLinks: ForecastLink[]
}
