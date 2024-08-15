import { PayloadAction, AsyncThunk } from '@reduxjs/toolkit'

// Helper function to handle rejected actions
export const handleRejected = (
  state: { loading: boolean; error: string | null },
  action: PayloadAction<string | unknown>,
) => {
  state.loading = false
  state.error =
    typeof action.payload === 'string'
      ? action.payload
      : 'An unknown error occurred'
}

// Define types for the state and action payloads
export interface AsyncState<T> {
  loading: boolean
  error: string | null
  data: T
}

type AsyncThunkConfig = {
  rejectValue: string
}

/**
 * Helper function to create async cases
 * @param builder
 * @param thunk
 * @param onFulfilled
 */
export const createAsyncCases = <T, ReturnedType>(
  builder: any,
  thunk: AsyncThunk<ReturnedType, any, AsyncThunkConfig>,
  onFulfilled: (
    state: AsyncState<T>,
    action: PayloadAction<ReturnedType>,
  ) => void,
) => {
  builder
    .addCase(thunk.pending, (state: AsyncState<T>) => {
      state.loading = true
      state.error = null
    })
    .addCase(thunk.fulfilled, onFulfilled)
    .addCase(thunk.rejected, handleRejected)
}
