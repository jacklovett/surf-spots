import { createSlice } from '@reduxjs/toolkit'
import {
  fetchAllSurfSpots,
  fetchSurfSpotById,
  addNewSurfSpot,
  editSurfSpot,
  deleteSurfSpotById,
} from '../../Services/surfSpotService'
import { initialState } from './index'
import { SurfSpot } from '../../Controllers/surfSpotController'
import { updateOrAddItem } from '../storeUtils'

const surfSpotsSlice = createSlice({
  name: 'surfSpots',
  initialState,
  reducers: {}, // No synchronous reducers defined here, but only async actions are used
  extraReducers: (builder) =>
    builder
      // Handle the pending state for fetching all surf spots
      .addCase(fetchAllSurfSpots.pending, (state) => {
        state.loading = true
        state.error = null
      })
      // Handle the fulfilled state for fetching all surf spots
      .addCase(fetchAllSurfSpots.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      // Handle the rejected state for fetching all surf spots
      .addCase(fetchAllSurfSpots.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Handle the pending state for fetching a surf spot by ID
      .addCase(fetchSurfSpotById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      // Handle the fulfilled state for fetching a surf spot by ID
      .addCase(fetchSurfSpotById.fulfilled, (state, action) => {
        state.loading = false
        state.data = updateOrAddItem(state.data, action.payload)
      })
      // Handle the rejected state for fetching a surf spot by ID
      .addCase(fetchSurfSpotById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Handle the fulfilled state for adding a new surf spot
      .addCase(addNewSurfSpot.fulfilled, (state, action) => {
        state.data.push(action.payload)
      })
      // Handle the fulfilled state for editing a surf spot
      .addCase(editSurfSpot.fulfilled, (state, action) => {
        const { updatedSpot } = action.payload
        state.data = updateOrAddItem<SurfSpot>(state.data, updatedSpot)
      })
      // Handle the fulfilled state for deleting a surf spot by ID
      .addCase(deleteSurfSpotById.fulfilled, (state, action) => {
        state.data = state.data.filter((spot) => spot.id !== action.payload)
      }),
})

export default surfSpotsSlice.reducer
