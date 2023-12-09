import { get, post, edit, deleteData } from './../Managers/networkManager'

// surfSpotTypes.ts

export interface Coordinates {
  longitude: number
  latitude: number
}

export interface SurfSpot {
  id: string // Assuming id is a string
  country: string
  region: string
  name: string
  description: string
  coordinates: Coordinates
}

export interface NewSurfSpot {
  country: string
  region: string
  name: string
  description: string
  coordinates: Coordinates
}

export interface UpdatedSurfSpot {
  country?: string
  region?: string
  name?: string
  description?: string
  coordinates?: Coordinates
}

export const getAllSurfSpots = async (): Promise<Array<SurfSpot>> => {
  try {
    const surfSpots = await get<Array<SurfSpot>>('surf-spots')
    return surfSpots ?? []
  } catch (error) {
    console.error('Error fetching surf spots:', error)
    return []
  }
}

export const getSurfSpotById = async (id: string): Promise<SurfSpot | null> => {
  try {
    const surfSpot = await get<SurfSpot>(`${id}`)
    return surfSpot
  } catch (error) {
    console.error('Error fetching surf spot by ID:', error)
    return null
  }
}

export const createSurfSpot = async (
  newSurfSpot: SurfSpot,
): Promise<SurfSpot | null> => {
  try {
    const createdSurfSpot = await post<SurfSpot>('', newSurfSpot)
    return createdSurfSpot
  } catch (error) {
    console.error('Error creating surf spot:', error)
    return null
  }
}

export const updateSurfSpot = async (
  id: string,
  updatedSurfSpot: UpdatedSurfSpot,
): Promise<boolean> => {
  try {
    await edit(`${id}`, updatedSurfSpot)
    return true
  } catch (error) {
    console.error('Error updating surf spot:', error)
    return false
  }
}

export const deleteSurfSpot = async (id: string): Promise<boolean> => {
  try {
    await deleteData(`${id}`)
    return true
  } catch (error) {
    console.error('Error deleting surf spot:', error)
    return false
  }
}
