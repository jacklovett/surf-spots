import { createSelector } from '@reduxjs/toolkit'
import { SurfSpot } from '../../Controllers/surfSpotController'
import surfSpotsReducer, {
  fetchSurfSpotsRequest,
  fetchSurfSpotsSuccess,
  fetchSurfSpotsFailure,
  fetchSurfSpotSuccess,
  addSurfSpotSuccess,
  editSurfSpotSuccess,
  deleteSurfSpotSuccess,
  addSurfSpotFailure,
  deleteSurfSpotFailure,
  editSurfSpotFailure,
} from './surfSpotsSlice'
import { AsyncState } from '../storeUtils'

export interface SurfSpotsState extends AsyncState {
  surfSpots: SurfSpot[]
}

// Selectors
const selectSurfSpots = (state: SurfSpotsState) => state.surfSpots
const selectSurfSpotById = (id: string) =>
  createSelector([selectSurfSpots], (surfSpots) =>
    surfSpots.length > 0 ? surfSpots.find((spot) => spot.id === id) : null,
  )
const selectSurfSpotsLoading = (state: SurfSpotsState) => state.loading
const selectSurfSpotsError = (state: SurfSpotsState) => state.error

// Export everything
export {
  fetchSurfSpotsRequest,
  fetchSurfSpotsSuccess,
  fetchSurfSpotsFailure,
  fetchSurfSpotSuccess,
  addSurfSpotSuccess,
  addSurfSpotFailure,
  editSurfSpotSuccess,
  editSurfSpotFailure,
  deleteSurfSpotSuccess,
  deleteSurfSpotFailure,
  selectSurfSpots,
  selectSurfSpotById,
  selectSurfSpotsLoading,
  selectSurfSpotsError,
}

export default surfSpotsReducer
