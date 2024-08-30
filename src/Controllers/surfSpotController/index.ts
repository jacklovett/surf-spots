import {
  createSurfSpot,
  deleteSurfSpot,
  getAllSurfSpots,
  getSurfSpotById,
  updateSurfSpot,
} from './surfSpotsController'

export interface Coordinates {
  longitude: number
  latitude: number
}

export type Continents =
  | 'Africa'
  | 'Antartica'
  | 'Asia'
  | 'Australia'
  | 'Europe'
  | 'North America'
  | 'South America'

export interface SurfSpot extends NewSurfSpot {
  id: string // Assuming id is a string
}

export interface NewSurfSpot {
  country: string
  region: string
  continent: Continents
  name: string
  description: string
  rating: number
  type: string
  coordinates?: Coordinates
}

export {
  getAllSurfSpots,
  getSurfSpotById,
  createSurfSpot,
  updateSurfSpot,
  deleteSurfSpot,
}
