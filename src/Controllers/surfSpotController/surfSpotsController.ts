import { get, edit, post, deleteData } from '../networkController'
import { NewSurfSpot, SurfSpot, UpdatedSurfSpot } from './index'

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
  newSurfSpot: NewSurfSpot,
): Promise<SurfSpot | null> => {
  try {
    const createdSurfSpot = await post<NewSurfSpot>('', newSurfSpot)
    return createdSurfSpot as SurfSpot
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
