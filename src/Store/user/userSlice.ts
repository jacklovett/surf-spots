import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '../../Controllers/userController'
import { UserState } from './index'

export const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'surfSpots',
  initialState,
  reducers: {
    fetchUserRequest: (state) => {
      state.loading = true
      state.error = null
    },
    fetchUserSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false
      state.user = action.payload
    },
    fetchUserFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    editUserSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false
      state.user = action.payload
    },
    editUserFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    deleteUserSuccess: (state) => {
      state.loading = false
      state.user = null
    },
    deleteUserFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
  },
})

export const {
  fetchUserRequest,
  fetchUserSuccess,
  fetchUserFailure,
  editUserSuccess,
  editUserFailure,
  deleteUserSuccess,
  deleteUserFailure,
} = userSlice.actions

// Export the reducer
export default userSlice.reducer
