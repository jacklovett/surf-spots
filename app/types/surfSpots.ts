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

export enum SurfSpotType {
  BeachBreak = 'Beach Break',
  ReefBreak = 'Reef Break',
  PointBreak = 'Point Break',
}

export interface SurfSpot extends NewSurfSpot {
  id: string
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
