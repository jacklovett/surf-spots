import { PayloadAction, AsyncThunk } from '@reduxjs/toolkit'

/**
 * Helper function to handle rejected actions
 * @param state
 * @param action
 */
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

/**
 * Utility function to update or add an item in the array
 * @param items
 * @param newItem
 * @returns array of generic type T
 */
export const updateOrAddItem = <T extends { id: string }>(
  items: T[],
  newItem: T,
): T[] => {
  // Find the index of the item in the array
  const index = items.findIndex((item) => item.id === newItem.id)
  if (index !== -1) {
    // If item exists, update it
    items[index] = newItem
  } else {
    // If item does not exist, add it
    items.push(newItem)
  }
  return items
}

// Define types for the state and action payloads
export interface AsyncState<T> {
  loading: boolean
  error: string | null
  data: T
}

export type AsyncThunkConfig = {
  rejectValue: string
}

/**
 * Helper function to create async cases
 * @param builder
 * @param thunk
 * @param onFulfilled
 */
export const createAsyncCases = <T, ReturnType>(
  builder: any,
  thunk: AsyncThunk<ReturnType, any, AsyncThunkConfig>,
  onFulfilled: (
    state: AsyncState<T>,
    action: PayloadAction<ReturnType>,
  ) => void,
) =>
  builder
    .addCase(thunk.pending, (state: AsyncState<T>) => {
      state.loading = true
      state.error = null
    })
    .addCase(thunk.fulfilled, onFulfilled)
    .addCase(thunk.rejected, handleRejected)
