// src/features/surfSpots/surfSpotsThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  SurfSpot,
  NewSurfSpot,
  UpdatedSurfSpot,
} from '../../Controllers/surfSpotsTypes'
import {
  getAllSurfSpots,
  getSurfSpotById,
  createSurfSpot,
  updateSurfSpot,
  deleteSurfSpot,
} from '../../Controllers/surfSpotsController'

// Define AsyncThunkConfig with rejectValue type
type AsyncThunkConfig = {
  rejectValue: string
}

// Fetch all surf spots
export const fetchAllSurfSpots = createAsyncThunk<
  SurfSpot[],
  void,
  AsyncThunkConfig
>('surfSpots/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await getAllSurfSpots()
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to fetch surf spots',
    )
  }
})

// Fetch a specific surf spot by ID
export const fetchSurfSpotById = createAsyncThunk<
  SurfSpot,
  string,
  AsyncThunkConfig
>('surfSpots/fetchById', async (id, { rejectWithValue }) => {
  try {
    const spot = await getSurfSpotById(id)
    if (spot) {
      return spot
    } else {
      return rejectWithValue(`Surf spot with ID ${id} not found`)
    }
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to fetch the surf spot',
    )
  }
})

// Add a new surf spot
export const addNewSurfSpot = createAsyncThunk<
  SurfSpot, // Expected return type
  NewSurfSpot, // Argument type
  { rejectValue: string } // Rejected value type
>('surfSpots/addNew', async (newSurfSpot, { rejectWithValue }) => {
  try {
    const createdSpot = await createSurfSpot(newSurfSpot)
    if (createdSpot) {
      return createdSpot // Return the created surf spot
    } else {
      return rejectWithValue('Failed to create a new surf spot')
    }
  } catch (error) {
    // Handle errors and return a string message
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : 'Failed to create a new surf spot',
    )
  }
})

// Edit an existing surf spot
export const editSurfSpot = createAsyncThunk<
  { id: string; updatedSpot: UpdatedSurfSpot },
  { id: string; updatedSpot: UpdatedSurfSpot },
  AsyncThunkConfig
>('surfSpots/edit', async ({ id, updatedSpot }, { rejectWithValue }) => {
  try {
    const success = await updateSurfSpot(id, updatedSpot)
    if (success) {
      return { id, updatedSpot }
    } else {
      return rejectWithValue('Failed to update surf spot')
    }
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to update surf spot',
    )
  }
})

// Delete a surf spot by ID
export const deleteSurfSpotById = createAsyncThunk<
  string,
  string,
  AsyncThunkConfig
>('surfSpots/delete', async (id, { rejectWithValue }) => {
  try {
    const success = await deleteSurfSpot(id)
    if (success) {
      return id
    } else {
      return rejectWithValue('Failed to delete surf spot')
    }
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to delete surf spot',
    )
  }
})
