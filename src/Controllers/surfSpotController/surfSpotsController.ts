import { get, edit, post, deleteData } from '../networkController'
import { NewSurfSpot, SurfSpot } from './index'

export const getAllSurfSpots = async (): Promise<Array<SurfSpot>> => {
  try {
    const surfSpots = await get<Array<SurfSpot>>('surf-spots')
    return surfSpots ?? []
    // test data
    // return [
    //   {
    //     id: '1',
    //     name: 'Costa da Caparica',
    //     country: 'Portugal',
    //     continent: 'Europe',
    //     region: 'Lisbon',
    //     rating: 2,
    //     description: '',
    //   },
    //   {
    //     id: '2',
    //     name: 'Fistral',
    //     country: 'United Kingdom',
    //     continent: 'Europe',
    //     region: 'Cornwall',
    //     rating: 3,
    //     description: '',
    //   },
    // ]
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
  updatedSurfSpot: SurfSpot,
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
