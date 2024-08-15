import { deleteSurfSpot } from '../../Controllers/surfSpotsController'
import { SurfSpot } from '../../Controllers/surfSpotsTypes'
import { AsyncState } from '../utils'
import {
  addNewSurfSpot,
  editSurfSpot,
  fetchAllSurfSpots,
  fetchSurfSpotById,
} from './surfSpotsThunk'

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
  deleteSurfSpot,
  editSurfSpot,
  fetchAllSurfSpots,
  fetchSurfSpotById,
}
