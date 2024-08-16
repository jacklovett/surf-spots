import { SurfSpot } from '../../Controllers/surfSpotController'
import {
  addNewSurfSpot,
  editSurfSpot,
  fetchAllSurfSpots,
  fetchSurfSpotById,
  deleteSurfSpotById,
} from '../../Services/surfSpotService'
import { AsyncState } from '../storeUtils'

// State

export interface SurfSpotsState extends AsyncState<SurfSpot[]> {}

export const initialState: SurfSpotsState = {
  data: [],
  loading: false,
  error: null,
}

// Selector
export const selectSurfSpotsState = (state: SurfSpotsState) => state

export {
  addNewSurfSpot,
  deleteSurfSpotById,
  editSurfSpot,
  fetchAllSurfSpots,
  fetchSurfSpotById,
}
