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

export interface SurfSpot extends NewSurfSpot {
  id: string // Assuming id is a string
  country: string
  region: string
  name: string
  description: string
  coordinates: Coordinates
  rating: number
}

export interface NewSurfSpot {
  country: string
  region: string
  name: string
  description: string
  coordinates: Coordinates
  rating: number
}

export interface UpdatedSurfSpot {
  country?: string
  region?: string
  name?: string
  description?: string
  coordinates?: Coordinates
  rating: number
}

export {
  getAllSurfSpots,
  getSurfSpotById,
  createSurfSpot,
  updateSurfSpot,
  deleteSurfSpot,
}
