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
export interface AsyncState {
  loading: boolean
  error: string | null
}
