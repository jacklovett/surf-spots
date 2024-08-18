import { createSelector } from '@reduxjs/toolkit'
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
const selectSurfSpotsState = (state: { surfSpots: SurfSpotsState }) =>
  state.surfSpots
const selectSurfSpotById = (id: string) =>
  createSelector([selectSurfSpotsState], (surfSpots) =>
    surfSpots.data.find((spot: SurfSpot) => spot.id === id),
  )
const selectSurfSpotsLoading = (state: { surfSpots: SurfSpotsState }) =>
  state.surfSpots.loading
const selectSurfSpotsError = (state: { surfSpots: SurfSpotsState }) =>
  state.surfSpots.error

export {
  addNewSurfSpot,
  deleteSurfSpotById,
  editSurfSpot,
  fetchAllSurfSpots,
  fetchSurfSpotById,
  selectSurfSpotsState,
  selectSurfSpotById,
  selectSurfSpotsError,
  selectSurfSpotsLoading,
}
