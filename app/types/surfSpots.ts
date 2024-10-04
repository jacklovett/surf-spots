export interface Coordinates {
  longitude?: number
  latitude?: number
}

export type Continents =
  | 'Africa'
  | 'Asia'
  | 'Australia'
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

export interface SurfSpot extends NewSurfSpot {
  id: string
  slug: string
}

export interface NewSurfSpot {
  country: string
  region: string
  continent: Continents
  name: string
  description: string
  rating: number
  type: SurfSpotType
  coordinates?: Coordinates
}
