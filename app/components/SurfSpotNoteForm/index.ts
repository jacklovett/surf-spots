import { SurfSpotNoteForm } from './SurfSpotNoteForm'

/**
 * Parse swell range string (e.g., "2-4ft" or "2-4") to min/max values
 * @param rangeStr - The swell range string to parse
 * @returns Object with min and max as strings, or empty strings if invalid
 */
export const parseSwellRange = (rangeStr: string | null | undefined): { min: string; max: string } => {
  if (!rangeStr) return { min: '', max: '' }
  const match = rangeStr.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/)
  if (match) {
    return { min: match[1], max: match[2] }
  }
  return { min: '', max: '' }
}

/**
 * Format min/max values to swell range string
 * @param min - Minimum swell height value
 * @param max - Maximum swell height value
 * @param waveUnits - The unit to append ('m' or 'ft')
 * @returns Formatted swell range string (e.g., "2-4ft", "2m+", "up to 4ft")
 */
export const formatSwellRange = (min: string, max: string, waveUnits: string): string => {
  if (!min && !max) return ''
  if (min && max) return `${min}-${max}${waveUnits}`
  if (min) return `${min}${waveUnits}+`
  if (max) return `up to ${max}${waveUnits}`
  return ''
}

export default SurfSpotNoteForm

