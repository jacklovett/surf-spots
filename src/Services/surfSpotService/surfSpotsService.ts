import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  SurfSpot,
  NewSurfSpot,
  UpdatedSurfSpot,
  deleteSurfSpot,
  createSurfSpot,
  getAllSurfSpots,
  getSurfSpotById,
  updateSurfSpot,
} from '../../Controllers/surfSpotController'

// Fetch all surf spots
export const fetchAllSurfSpots = createAsyncThunk<
  SurfSpot[],
  void,
  { rejectValue: string }
>('surfSpots/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await getAllSurfSpots()
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to fetch surf spots',
    )
  }
})

// Fetch a surf spot by ID
export const fetchSurfSpotById = createAsyncThunk<
  SurfSpot,
  string,
  { rejectValue: string }
>('surfSpots/fetchById', async (id, { rejectWithValue }) => {
  try {
    const spot = await getSurfSpotById(id)
    if (spot) return spot
    return rejectWithValue(`Surf spot with ID ${id} not found`)
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to fetch surf spot',
    )
  }
})

// Add a new surf spot
export const addNewSurfSpot = createAsyncThunk<
  SurfSpot,
  NewSurfSpot,
  { rejectValue: string }
>('surfSpots/addNew', async (newSurfSpot, { rejectWithValue }) => {
  try {
    const createdSpot = await createSurfSpot(newSurfSpot)
    if (createdSpot) return createdSpot
    return rejectWithValue('Failed to create a new surf spot')
  } catch (error) {
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : 'Failed to create a new surf spot',
    )
  }
})

// Edit a surf spot
export const editSurfSpot = createAsyncThunk<
  { id: string; updatedSpot: UpdatedSurfSpot },
  { id: string; updatedSpot: UpdatedSurfSpot },
  { rejectValue: string }
>('surfSpots/edit', async ({ id, updatedSpot }, { rejectWithValue }) => {
  try {
    const success = await updateSurfSpot(id, updatedSpot)
    if (success) return { id, updatedSpot }
    return rejectWithValue('Failed to update surf spot')
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to update surf spot',
    )
  }
})

// Delete a surf spot
export const deleteSurfSpotById = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('surfSpots/delete', async (id, { rejectWithValue }) => {
  try {
    const success = await deleteSurfSpot(id)
    if (success) return id
    return rejectWithValue('Failed to delete surf spot')
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to delete surf spot',
    )
  }
})
