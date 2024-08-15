import { configureStore } from '@reduxjs/toolkit'
import surfSpotsReducer from './surfSpots/surfSpotsSlice'

export const store = configureStore({
  reducer: {
    surfSpots: surfSpotsReducer,
  },
})

// Infer types for better type safety in your app
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
