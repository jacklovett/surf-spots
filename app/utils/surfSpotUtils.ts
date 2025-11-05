/**
 * Rounds a value to appropriate precision for surf height display
 * - Feet: Always rounded to whole numbers (e.g., 2ft, 3ft, 4-6ft)
 * - Meters: 1 decimal place if < 1m (e.g., 0.6m), otherwise round to 1 decimal if meaningful (e.g., 1.2m), or whole number (e.g., 1m, 2m)
 */
const roundSurfHeight = (value: number, isImperial: boolean): number => {
  if (isImperial) {
    // Feet: Always round to whole number
    return Math.round(value)
  } else {
    // Meters: 1 decimal if < 1m, otherwise round to nearest 0.1
    // If the decimal is .0, it will be formatted as a whole number
    return Math.round(value * 10) / 10
  }
}

export const formatSurfHeightRange = (
  preferredUnits: string,
  minSurfHeight?: number,
  maxSurfHeight?: number,
) => {
  if (!minSurfHeight && !maxSurfHeight) {
    return '-'
  }

  const isImperial = preferredUnits === 'imperial'

  // Convert meters to feet if imperial
  const convertToDisplayValue = (height: number): number => {
    if (isImperial) {
      // Convert meters to feet (1m ≈ 3.28084ft)
      return height * 3.28084
    }
    return height
  }

  const min = minSurfHeight
    ? roundSurfHeight(convertToDisplayValue(minSurfHeight), isImperial)
    : 0
  const max = maxSurfHeight
    ? roundSurfHeight(convertToDisplayValue(maxSurfHeight), isImperial)
    : null

  const unit = isImperial ? 'ft' : 'm'

  // Format with appropriate decimal places
  const formatValue = (value: number): string => {
    if (isImperial) {
      // Feet: Always whole number
      return value.toString()
    } else {
      // Meters: Show 1 decimal if < 1m, otherwise show 1 decimal if needed (e.g., 1.2m), whole number if .0 (e.g., 1m)
      if (value < 1) {
        return value.toFixed(1)
      }
      // For >= 1m, check if it's a whole number
      const rounded = Math.round(value)
      if (Math.abs(value - rounded) < 0.05) {
        // Very close to whole number, show as whole number
        return rounded.toString()
      }
      // Show 1 decimal place
      return value.toFixed(1)
    }
  }

  const heightRange = max
    ? `${formatValue(min)}-${formatValue(max)}`
    : `+${formatValue(min)}`
  return `${heightRange}${unit}`
}

export const formatSeason = (seasonStart?: string, seasonEnd?: string) => {
  if (!seasonStart && !seasonEnd) return '-'
  if (seasonStart && seasonEnd) return `${seasonStart} - ${seasonEnd}`
  return seasonStart || seasonEnd || '-'
}
