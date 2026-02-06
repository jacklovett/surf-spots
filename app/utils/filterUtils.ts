import type { SurfSpotFilters } from '~/types/surfSpots'

// Define Option interface locally to avoid circular dependency
// This matches the Option interface from FormInput
interface Option {
  key: string
  value: string
  label: string
}

/**
 * Backend filter format matching SurfSpotFilterDTO
 */
export interface BackendFilterFormat {
  userId?: string
  type?: string[]
  beachBottomType?: string[]
  skillLevel?: string[]
  tide?: string[]
  waveDirection?: string[]
  minSurfHeight?: number
  maxSurfHeight?: number
  minRating?: number
  maxRating?: number
  swellDirection?: string[]
  windDirection?: string[]
  parking?: string[]
  status?: string
  boatRequired?: boolean
  isWavepool?: boolean
  isRiverWave?: boolean
  foodOptions?: string[]
  accommodationOptions?: string[]
  facilities?: string[]
  hazards?: string[]
  forecasts?: string[]
  seasons?: string[]
}

/**
 * Converts frontend filter format to backend filter format
 * Maps breakType -> type and beachBottom -> beachBottomType
 * Also handles Option arrays and converts them to the format expected by the backend
 */
export const convertFiltersToBackendFormat = (
  filters: SurfSpotFilters,
): BackendFilterFormat => {
  const backendFilters: BackendFilterFormat = {}

  // Convert breakType to type
  if (filters.breakType?.length > 0) {
    backendFilters.type = filters.breakType
  }

  // Convert beachBottom to beachBottomType
  if (filters.beachBottom?.length > 0) {
    backendFilters.beachBottomType = filters.beachBottom
  }

  // Copy other filters as-is
  if (filters.skillLevel?.length > 0) {
    backendFilters.skillLevel = filters.skillLevel
  }

  if (filters.tide?.length > 0) {
    backendFilters.tide = filters.tide
  }

  if (filters.waveDirection?.length > 0) {
    backendFilters.waveDirection = filters.waveDirection
  }

  // Swell direction - send array, backend will handle OR logic with substring matching
  if (filters.swellDirection?.length > 0) {
    backendFilters.swellDirection = filters.swellDirection
  }

  // Wind direction - send array, backend will handle OR logic with substring matching
  if (filters.windDirection?.length > 0) {
    backendFilters.windDirection = filters.windDirection
  }

  if (filters.rating && filters.rating > 0) {
    backendFilters.minRating = filters.rating
  }

  if (filters.isWavepool !== undefined) {
    backendFilters.isWavepool = filters.isWavepool
  }

  if (filters.isRiverWave !== undefined) {
    backendFilters.isRiverWave = filters.isRiverWave
  }

  // Convert Option arrays to string arrays
  if (filters.parking?.length > 0) {
    backendFilters.parking = filters.parking.map((opt: Option) => opt.value)
  }

  if (filters.foodOptions?.length > 0) {
    backendFilters.foodOptions = filters.foodOptions.map(
      (opt: Option) => opt.value,
    )
  }

  if (filters.accommodationOptions?.length > 0) {
    backendFilters.accommodationOptions = filters.accommodationOptions.map(
      (opt: Option) => opt.value,
    )
  }

  if (filters.hazards?.length > 0) {
    backendFilters.hazards = filters.hazards.map((opt: Option) => opt.value)
  }

  if (filters.facilities?.length > 0) {
    backendFilters.facilities = filters.facilities.map(
      (opt: Option) => opt.value,
    )
  }

  // Handle seasons filter - convert to format expected by backend
  if (filters.seasons?.length > 0) {
    backendFilters.seasons = filters.seasons
  }

  return backendFilters
}
