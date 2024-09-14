import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SurfSpot } from '../../Controllers/surfSpotController'
import { updateOrAddItem } from '../storeUtils'
import { SurfSpotsState } from './index'

// Define and export initialState
export const initialState: SurfSpotsState = {
  surfSpots: [],
  loading: false,
  error: null,
}

// Create the slice
const surfSpotsSlice = createSlice({
  name: 'surfSpots',
  initialState,
  reducers: {
    fetchSurfSpotsRequest: (state) => {
      state.loading = true
      state.error = null
    },
    fetchSurfSpotsSuccess: (state, action: PayloadAction<SurfSpot[]>) => {
      state.loading = false
      state.surfSpots = action.payload
    },
    fetchSurfSpotsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    fetchSurfSpotSuccess: (state, action: PayloadAction<SurfSpot>) => {
      state.loading = false
      state.surfSpots = updateOrAddItem(state.surfSpots, action.payload)
    },
    addSurfSpotSuccess: (state, action: PayloadAction<SurfSpot>) => {
      state.surfSpots = updateOrAddItem(state.surfSpots, action.payload)
    },
    addSurfSpotFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    editSurfSpotSuccess: (state, action: PayloadAction<SurfSpot>) => {
      state.surfSpots = updateOrAddItem(state.surfSpots, action.payload)
    },
    editSurfSpotFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    deleteSurfSpotSuccess: (state, action: PayloadAction<string>) => {
      state.surfSpots = state.surfSpots.filter(
        (spot) => spot.id !== action.payload,
      )
      state.loading = false // is this needed? or do we need a deleteSurfSpotRequest action?
    },
    deleteSurfSpotFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.loading = false
    },
  },
})

// Export actions
export const {
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
} = surfSpotsSlice.actions

// Export the reducer
export default surfSpotsSlice.reducer
