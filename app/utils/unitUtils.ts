/**
 * Unit conversion utilities
 * All values are stored in metric (cm for height, kg for weight, meters for distance)
 */

/**
 * Converts meters to feet - 1m ≈ 3.28ft
 * @param meters - distance in meters
 * @returns number - distance in feet
 */
export const metersToFeet = (meters: number): number =>
  Math.round(meters * 3.28084 * 10) / 10

/**
 * Converts km to miles - 1km ≈ 0.621371mi
 * @param km - distance in kilometers
 * @returns number - distance in miles
 */
export const kmToMiles = (km: number): number => km * 0.621371

/**
 * Converts stored height (cm) to display format (same format as surfboard length)
 * @param heightCm - height in centimeters
 * @param units - preferred display units
 * @returns height in display format (cm number for metric, "5'10" string for imperial)
 */
export const convertHeightToDisplay = (
  heightCm: number | undefined,
  units: 'metric' | 'imperial',
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
  heightDisplay: string | number | undefined,
  units: 'metric' | 'imperial',
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
  weightKg: number | undefined,
  units: 'metric' | 'imperial',
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
  weightDisplay: string | number | undefined,
  units: 'metric' | 'imperial',
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
export const getHeightLabel = (units: 'metric' | 'imperial'): string => {
  return units === 'metric' ? 'Height (cm)' : 'Height (ft/in)'
}

/**
 * Gets the weight label based on preferred units
 * @param units - preferred display units
 * @returns label string
 */
export const getWeightLabel = (units: 'metric' | 'imperial'): string => {
  return units === 'metric' ? 'Weight (kg)' : 'Weight (st/lbs)'
}

/**
 * Validates and converts height from display format to stored format (cm)
 * @param heightDisplay - height input string
 * @param units - preferred display units
 * @returns object with isValid flag, error message, and converted value in cm
 */
export const validateAndConvertHeight = (
  heightDisplay: string | undefined,
  units: 'metric' | 'imperial',
): { isValid: boolean; error?: string; value?: number } => {
  if (!heightDisplay || !heightDisplay.trim()) {
    return { isValid: true, value: undefined }
  }

  if (units === 'metric') {
    const heightNum = parseFloat(heightDisplay)
    if (isNaN(heightNum) || heightNum < 50 || heightNum > 300) {
      return { isValid: false, error: 'Please enter a valid height' }
    }
  } else {
    const totalInches = parseHeightImperial(heightDisplay)
    if (totalInches === undefined || totalInches < 20 || totalInches > 120) {
      return { isValid: false, error: 'Please enter a valid height' }
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
  weightDisplay: string | undefined,
  units: 'metric' | 'imperial',
): { isValid: boolean; error?: string; value?: number } => {
  if (!weightDisplay || !weightDisplay.trim()) {
    return { isValid: true, value: undefined }
  }

  if (units === 'metric') {
    const weightNum = parseFloat(weightDisplay)
    if (isNaN(weightNum) || weightNum < 10 || weightNum > 500) {
      return { isValid: false, error: 'Please enter a valid weight' }
    }
  } else {
    const totalLbs = parseWeightImperial(weightDisplay)
    if (totalLbs === undefined || totalLbs < 20 || totalLbs > 1100) {
      return { isValid: false, error: 'Please enter a valid weight' }
    }
  }

  const value = convertWeightFromDisplay(weightDisplay, units)
  return { isValid: true, value }
}
