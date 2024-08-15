import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
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
import { createAsyncCases } from '../utils'
import { initialState, SurfSpotsState } from './index'

// Thunks

export const fetchAllSurfSpots = createAsyncThunk<
  SurfSpot[],
  void,
  { rejectValue: string }
>('surfSpots/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const surfSpots = await getAllSurfSpots()
    return surfSpots
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to fetch surf spots',
    )
  }
})

export const fetchSurfSpotById = createAsyncThunk<
  SurfSpot,
  string,
  { rejectValue: string }
>('surfSpots/fetchById', async (id, { rejectWithValue }) => {
  try {
    const spot = await getSurfSpotById(id)
    if (spot) {
      return spot
    }
    return rejectWithValue(`Surf spot with ID ${id} not found`)
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to fetch the surf spot',
    )
  }
})

export const addNewSurfSpot = createAsyncThunk<
  SurfSpot,
  NewSurfSpot,
  { rejectValue: string }
>('surfSpots/addNew', async (newSurfSpot, { rejectWithValue }) => {
  try {
    const createdSpot = await createSurfSpot(newSurfSpot)
    return createdSpot ?? rejectWithValue('Failed to create a new surf spot')
  } catch (error) {
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : 'Failed to create a new surf spot',
    )
  }
})

export const editSurfSpot = createAsyncThunk<
  { id: string; updatedSpot: UpdatedSurfSpot },
  { id: string; updatedSpot: UpdatedSurfSpot },
  { rejectValue: string }
>('surfSpots/edit', async ({ id, updatedSpot }, { rejectWithValue }) => {
  try {
    const success = await updateSurfSpot(id, updatedSpot)
    return success
      ? { id, updatedSpot }
      : rejectWithValue('Failed to update surf spot')
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to update surf spot',
    )
  }
})

export const deleteSurfSpotById = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('surfSpots/delete', async (id, { rejectWithValue }) => {
  try {
    const success = await deleteSurfSpot(id)
    return success ? id : rejectWithValue('Failed to delete surf spot')
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to delete surf spot',
    )
  }
})

// Slice
const surfSpotsSlice = createSlice({
  name: 'surfSpots',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    createAsyncCases(
      builder,
      fetchAllSurfSpots,
      (state: SurfSpotsState, action: PayloadAction<SurfSpot[]>) => {
        state.loading = false
        state.data = action.payload
      },
    )
    createAsyncCases(
      builder,
      fetchSurfSpotById,
      (state: SurfSpotsState, action: PayloadAction<SurfSpot>) => {
        state.loading = false
        const spotIndex = state.data.findIndex(
          (spot: SurfSpot) => spot.id === action.payload.id,
        )
        if (spotIndex >= 0) {
          state.data[spotIndex] = action.payload
        } else {
          state.data.push(action.payload)
        }
      },
    )
    createAsyncCases(
      builder,
      addNewSurfSpot,
      (state: SurfSpotsState, action: PayloadAction<SurfSpot>) => {
        state.data.push(action.payload)
      },
    )
    createAsyncCases(
      builder,
      editSurfSpot,
      (
        state: SurfSpotsState,
        action: PayloadAction<{ id: string; updatedSpot: UpdatedSurfSpot }>,
      ) => {
        const index = state.data.findIndex(
          (spot: SurfSpot) => spot.id === action.payload.id,
        )
        if (index !== -1) {
          state.data[index] = {
            ...state.data[index],
            ...action.payload.updatedSpot,
          }
        }
      },
    )
    createAsyncCases(
      builder,
      deleteSurfSpotById,
      (state: SurfSpotsState, action: PayloadAction<string>) => {
        state.data = state.data.filter(
          (spot: SurfSpot) => spot.id !== action.payload,
        )
      },
    )
  },
})

export default surfSpotsSlice.reducer
