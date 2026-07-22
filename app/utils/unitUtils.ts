/**
 * Unit conversion utilities
 * All values are stored in metric (cm for height, kg for weight, meters for distance)
 */

import { ERROR_INVALID_HEIGHT, ERROR_INVALID_WEIGHT } from './errorUtils'

export type PreferredUnits = 'metric' | 'imperial'

const FEET_PER_METER = 3.28084
const MILES_PER_KM = 0.621371

/**
 * Converts meters to feet - 1m ≈ 3.28ft
 * @param meters - distance in meters
 * @returns number - distance in feet
 */
export const metersToFeet = (meters: number): number =>
  Math.round(meters * FEET_PER_METER * 10) / 10

/**
 * Converts km to miles - 1km ≈ 0.621371mi
 * @param km - distance in kilometers
 * @returns number - distance in miles
 */
export const kmToMiles = (km: number): number => km * MILES_PER_KM

/**
 * Converts stored surf height (meters) to the user's preferred display unit.
 * Imperial rounds to whole feet (matches spot detail formatting).
 */
export const convertSurfHeightToDisplay = (
  heightMeters?: number,
  units: PreferredUnits = 'metric',
): number | undefined => {
  if (typeof heightMeters !== 'number' || Number.isNaN(heightMeters)) {
    return undefined
  }
  if (units === 'imperial') {
    return Math.round(heightMeters * FEET_PER_METER)
  }
  return Math.round(heightMeters * 10) / 10
}

/**
 * Converts a surf height entered in preferred units back to meters for storage.
 */
export const convertSurfHeightToStored = (
  heightDisplay?: number,
  units: PreferredUnits = 'metric',
): number | undefined => {
  if (typeof heightDisplay !== 'number' || Number.isNaN(heightDisplay)) {
    return undefined
  }
  if (units === 'imperial') {
    return heightDisplay / FEET_PER_METER
  }
  return heightDisplay
}

/**
 * Formats a distance stored in kilometers for display.
 * Metric: meters below 1 km, otherwise km.
 * Imperial: feet below 1 mi, otherwise mi.
 */
export const formatDistanceKm = (
  distanceKm: number,
  units: PreferredUnits = 'metric',
): string => {
  if (units === 'imperial') {
    const distanceMiles = kmToMiles(distanceKm)
    if (distanceMiles < 1) {
      return `${Math.round(distanceKm * 1000 * FEET_PER_METER)} ft`
    }
    return `${distanceMiles.toFixed(1)} mi`
  }
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`
  }
  return `${distanceKm.toFixed(1)} km`
}

/**
 * Converts stored height (cm) to display format (same format as surfboard length)
 * @param heightCm - height in centimeters
 * @param units - preferred display units
 * @returns height in display format (cm number for metric, "5'10" string for imperial)
 */
export const convertHeightToDisplay = (
  heightCm?: number,
  units: PreferredUnits = 'metric',
): string | number | undefined => {
  if (!heightCm) return undefined
  if (units === 'metric') return heightCm
  // Convert cm to total inches, then format as feet'inches (same as formatLength)
  const totalInches = Math.round(heightCm / 2.54)
  const feet = Math.floor(totalInches / 12)
  const inches = totalInches % 12
  if (inches === 0) {
    return `${feet}'`
  }
  return `${feet}'${inches}`
}

/**
 * Parses height input in feet'inches format (same as surfboard length format)
 * Accepts "5'10" or "5'10" format (with optional quote) or decimal format
 * @param value - Input string like "5'10", "5'10", or "70" (total inches)
 * @returns Total inches or undefined if invalid
 */
export const parseHeightImperial = (value: string): number | undefined => {
  if (!value || !value.trim()) return undefined

  const trimmed = value.trim()

  // Try "5'10" or "5'10" format (same regex as surfboard parseLength)
  const feetInchesMatch = trimmed.match(/^(\d+)'(\d+)"?$/)
  if (feetInchesMatch) {
    const feet = parseInt(feetInchesMatch[1], 10)
    const inches = parseInt(feetInchesMatch[2], 10)
    if (inches >= 0 && inches < 12) {
      return feet * 12 + inches
    }
  }

  // Try decimal format (total inches as fallback, same as surfboard parseLength)
  const decimal = parseFloat(trimmed)
  if (!isNaN(decimal)) {
    return decimal
  }

  return undefined
}

/**
 * Converts display height to stored units (cm)
 * @param heightDisplay - height in display format (number for metric, string like "5'10"" for imperial)
 * @param units - preferred display units
 * @returns height in centimeters
 */
export const convertHeightFromDisplay = (
  heightDisplay?: string | number,
  units: PreferredUnits = 'metric',
): number | undefined => {
  if (!heightDisplay) return undefined
  if (units === 'metric') {
    return typeof heightDisplay === 'number' ? heightDisplay : parseFloat(heightDisplay as string)
  }
  // Parse imperial format (feet'inches or total inches)
  const totalInches = typeof heightDisplay === 'string' 
    ? parseHeightImperial(heightDisplay)
    : heightDisplay
  if (!totalInches) return undefined
  // Convert inches to cm
  return Math.round(totalInches * 2.54)
}

/**
 * Parses weight input in stones'lbs format (e.g., "12st 5lbs", "12 5") or total lbs
 * @param value - Input string
 * @returns Total pounds or undefined if invalid
 */
export const parseWeightImperial = (value: string): number | undefined => {
  if (!value || !value.trim()) return undefined

  const trimmed = value.trim()

  // Try "12st 5lbs" or "12st 5" or "12 5" format
  const stonesLbsMatch = trimmed.match(/^(\d+)\s*st\s*(\d+)\s*(lbs?)?$/i)
  if (stonesLbsMatch) {
    const stones = parseInt(stonesLbsMatch[1], 10)
    const lbs = parseInt(stonesLbsMatch[2], 10)
    if (stones >= 0 && lbs >= 0 && lbs < 14) {
      return stones * 14 + lbs
    }
  }

  // Try "12st" format (stones only)
  const stonesOnlyMatch = trimmed.match(/^(\d+)\s*st$/i)
  if (stonesOnlyMatch) {
    const stones = parseInt(stonesOnlyMatch[1], 10)
    if (stones >= 0) {
      return stones * 14
    }
  }

  // Try "12 5" format (space separated)
  const spaceMatch = trimmed.match(/^(\d+)\s+(\d+)$/)
  if (spaceMatch) {
    const first = parseInt(spaceMatch[1], 10)
    const second = parseInt(spaceMatch[2], 10)
    // If first number is reasonable for stones (0-50) and second is reasonable for lbs (0-13)
    if (first >= 0 && first <= 50 && second >= 0 && second < 14) {
      return first * 14 + second
    }
  }

  // Try total lbs as fallback
  const totalLbs = parseFloat(trimmed)
  if (!isNaN(totalLbs) && totalLbs >= 0) {
    return totalLbs
  }

  return undefined
}

/**
 * Formats total pounds to stones and pounds format
 * @param totalLbs - Total weight in pounds
 * @returns Formatted string like "12st 5lbs" or "173lbs"
 */
export const formatWeightImperial = (totalLbs: number): string => {
  const stones = Math.floor(totalLbs / 14)
  const lbs = Math.round(totalLbs % 14)
  
  if (stones === 0) {
    return `${lbs}lbs`
  }
  if (lbs === 0) {
    return `${stones}st`
  }
  return `${stones}st ${lbs}lbs`
}

/**
 * Converts stored weight (kg) to display format
 * @param weightKg - weight in kilograms
 * @param units - preferred display units
 * @returns weight in display format (kg number for metric, "12st 5lbs" string for imperial)
 */
export const convertWeightToDisplay = (
  weightKg?: number,
  units: PreferredUnits = 'metric',
): string | number | undefined => {
  if (!weightKg) return undefined
  if (units === 'metric') return weightKg
  // Convert kg to lbs, then format as stones'lbs
  const totalLbs = Math.round(weightKg * 2.20462)
  return formatWeightImperial(totalLbs)
}

/**
 * Converts display weight to stored units (kg)
 * @param weightDisplay - weight in display format (number for metric, string like "12st 5lbs" for imperial)
 * @param units - preferred display units
 * @returns weight in kilograms
 */
export const convertWeightFromDisplay = (
  weightDisplay?: string | number,
  units: PreferredUnits = 'metric',
): number | undefined => {
  if (!weightDisplay) return undefined
  if (units === 'metric') {
    return typeof weightDisplay === 'number' ? weightDisplay : parseFloat(weightDisplay as string)
  }
  // Parse imperial format (stones'lbs or total lbs)
  const totalLbs = typeof weightDisplay === 'string'
    ? parseWeightImperial(weightDisplay)
    : weightDisplay
  if (!totalLbs) return undefined
  // Convert lbs to kg
  return Math.round(totalLbs / 2.20462)
}

/**
 * Gets the height label based on preferred units
 * @param units - preferred display units
 * @returns label string
 */
export const getHeightLabel = (units: PreferredUnits): string => {
  return units === 'metric' ? 'Height (cm)' : 'Height (ft/in)'
}

/**
 * Gets the weight label based on preferred units
 * @param units - preferred display units
 * @returns label string
 */
export const getWeightLabel = (units: PreferredUnits): string => {
  return units === 'metric' ? 'Weight (kg)' : 'Weight (st/lbs)'
}

/**
 * Gets the wave units based on preferred units
 * @param units - preferred display units
 * @returns wave unit string ('m' for metric, 'ft' for imperial)
 */
export const getWaveUnits = (units: PreferredUnits): string => {
  return units === 'metric' ? 'm' : 'ft'
}

/**
 * Gets the distance units based on preferred units
 * @param units - preferred display units
 * @returns distance unit string ('km' for metric, 'mi' for imperial)
 */
export const getDistanceUnits = (units: PreferredUnits): string => {
  return units === 'metric' ? 'km' : 'mi'
}

/**
 * Validates and converts height from display format to stored format (cm)
 * @param heightDisplay - height input string
 * @param units - preferred display units
 * @returns object with isValid flag, error message, and converted value in cm
 */
export const validateAndConvertHeight = (
  heightDisplay?: string,
  units: PreferredUnits = 'metric',
): { isValid: boolean; error?: string; value?: number } => {
  if (!heightDisplay || !heightDisplay.trim()) {
    return { isValid: true, value: undefined }
  }

  if (units === 'metric') {
    const heightNum = parseFloat(heightDisplay)
    if (isNaN(heightNum) || heightNum < 50 || heightNum > 300) {
      return { isValid: false, error: ERROR_INVALID_HEIGHT }
    }
  } else {
    const totalInches = parseHeightImperial(heightDisplay)
    if (totalInches === undefined || totalInches < 20 || totalInches > 120) {
      return { isValid: false, error: ERROR_INVALID_HEIGHT }
    }
  }

  const value = convertHeightFromDisplay(heightDisplay, units)
  return { isValid: true, value }
}

/**
 * Validates and converts weight from display format to stored format (kg)
 * @param weightDisplay - weight input string
 * @param units - preferred display units
 * @returns object with isValid flag, error message, and converted value in kg
 */
export const validateAndConvertWeight = (
  weightDisplay?: string,
  units: PreferredUnits = 'metric',
): { isValid: boolean; error?: string; value?: number } => {
  if (!weightDisplay || !weightDisplay.trim()) {
    return { isValid: true, value: undefined }
  }

  if (units === 'metric') {
    const weightNum = parseFloat(weightDisplay)
    if (isNaN(weightNum) || weightNum < 10 || weightNum > 500) {
      return { isValid: false, error: ERROR_INVALID_WEIGHT }
    }
  } else {
    const totalLbs = parseWeightImperial(weightDisplay)
    if (totalLbs === undefined || totalLbs < 20 || totalLbs > 1100) {
      return { isValid: false, error: ERROR_INVALID_WEIGHT }
    }
  }

  const value = convertWeightFromDisplay(weightDisplay, units)
  return { isValid: true, value }
}
