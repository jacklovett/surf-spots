import { Filters } from './Filters'
import { SurfSpotFilters } from '~/types/surfSpots'

/**
 * Helper to count applied filters (excluding empty arrays, zero rating, etc.)
 * @param filters
 * @returns number - count of applied filters
 */
export const getAppliedFiltersCount = (filters: SurfSpotFilters) => {
  let count = 0
  Object.entries(filters).forEach(([_, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      count += 1
    } else if (typeof value === 'number' && value > 0) {
      count += 1
    } else if (typeof value === 'boolean' && value) {
      count += 1
    }
  })
  return count > 0 ? count : undefined
}

export default Filters
