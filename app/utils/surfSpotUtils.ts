import { Direction } from '~/types/surfSpots'
import { DIRECTIONS } from '~/components/ConditionIcons/DirectionIcon'

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

import { SwellSeason } from '~/types/surfSpots'

export const formatSeason = (swellSeason?: SwellSeason | null) => {
  if (!swellSeason) return '-'
  if (swellSeason.start && swellSeason.end) {
    return `${swellSeason.start} - ${swellSeason.end}`
  }
  return swellSeason.start || swellSeason.end || '-'
}

/**
 * Convert direction string (e.g., "N" or "N-E") to array format for DirectionSelector
 * Generates all directions in the range, including intermediate ones
 * Used when loading surf spot data from backend (which stores as string) into DirectionSelector (which uses arrays)
 */
export const directionStringToArray = (directionStr: string): string[] => {
  if (!directionStr) return []
  const parts = directionStr.split('-')
  if (parts.length === 1) {
    return [parts[0]]
  }

  // For ranges like "N-E", generate all directions in between
  const directions: Direction[] = Object.keys(DIRECTIONS) as Direction[]
  const startIdx = directions.indexOf(parts[0] as Direction)
  const endIdx = directions.indexOf(parts[1] as Direction)

  if (startIdx === -1 || endIdx === -1) {
    // Invalid direction, return empty array
    return []
  }

  const range: string[] = []
  if (startIdx <= endIdx) {
    // Normal range (e.g., N to E)
    for (let i = startIdx; i <= endIdx; i++) {
      range.push(directions[i])
    }
  } else {
    // Wraps around (e.g., NW to NE)
    for (let i = startIdx; i < directions.length; i++) {
      range.push(directions[i])
    }
    for (let i = 0; i <= endIdx; i++) {
      range.push(directions[i])
    }
  }

  return range
}

/**
 * Convert direction array to string format for backend (e.g., ["N", "NE", "E"] -> "N-E", ["N"] -> "N")
 * Used when saving DirectionSelector array values (from form) to backend (which expects string)
 */
export const directionArrayToString = (directionArray: string[]): string => {
  if (!directionArray || directionArray.length === 0) return ''
  if (directionArray.length === 1) return directionArray[0]
  // For ranges, join with hyphen (e.g., ["N", "NE", "E"] -> "N-E")
  return `${directionArray[0]}-${directionArray[directionArray.length - 1]}`
}
