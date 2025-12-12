/**
 * Parses surfboard length in format "6'1" or "6.5" to decimal feet
 * @param value - Input string like "6'1", "6'6", "6.5"
 * @returns Decimal feet or undefined if invalid
 */
export const parseLength = (value: string): number | undefined => {
  if (!value || !value.trim()) return undefined

  const trimmed = value.trim()

  // Try "6'1" or "6'6" format
  const feetInchesMatch = trimmed.match(/^(\d+)'(\d+)"?$/)
  if (feetInchesMatch) {
    const feet = parseInt(feetInchesMatch[1], 10)
    const inches = parseInt(feetInchesMatch[2], 10)
    if (inches >= 0 && inches < 12) {
      return feet + inches / 12
    }
  }

  // Try decimal format "6.5"
  const decimal = parseFloat(trimmed)
  if (!isNaN(decimal)) {
    return decimal
  }

  return undefined
}

/**
 * Formats decimal feet to "6'1" format
 * @param value - Decimal feet (e.g., 6.083 for 6'1")
 * @returns Formatted string like "6'1" or "6'"
 */
export const formatLength = (value: number | undefined): string => {
  if (value === undefined || value === null) return ''
  const feet = Math.floor(value)
  const inches = Math.round((value - feet) * 12)
  if (inches === 0) {
    return `${feet}'`
  }
  return `${feet}'${inches}`
}

/**
 * Parses surfboard dimension with fractions like "20 1/2", "20/2", "2 5/8", "2/8"
 * @param value - Input string
 * @returns Decimal inches or undefined if invalid
 */
export const parseDimension = (value: string): number | undefined => {
  if (!value || !value.trim()) return undefined

  const trimmed = value.trim()

  // Try "20 1/2" format (whole number + fraction)
  const wholeFractionMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/)
  if (wholeFractionMatch) {
    const whole = parseInt(wholeFractionMatch[1], 10)
    const num = parseInt(wholeFractionMatch[2], 10)
    const den = parseInt(wholeFractionMatch[3], 10)
    if (den !== 0) {
      return whole + num / den
    }
  }

  // Try "20/2" format - in surfboard context, treat as shorthand for "20 1/2"
  // e.g., "20/2" = 20.5, "41/2" = 20.5, "2/8" = 0.25
  const fractionOnlyMatch = trimmed.match(/^(\d+)\/(\d+)$/)
  if (fractionOnlyMatch) {
    const num = parseInt(fractionOnlyMatch[1], 10)
    const den = parseInt(fractionOnlyMatch[2], 10)
    if (den !== 0) {
      // For common fraction denominators (2, 4, 8, 16), treat as whole + fraction
      // e.g., "20/2" means "20 1/2" = 20.5, "41/2" = 20.5, "2/8" = 0.25
      if ([2, 4, 8, 16].includes(den)) {
        const whole = Math.floor(num / den)
        const remainder = num % den
        return whole + remainder / den
      }
      // For other denominators, treat as simple division
      return num / den
    }
  }

  // Try decimal format "20.5"
  const decimal = parseFloat(trimmed)
  if (!isNaN(decimal)) {
    return decimal
  }

  return undefined
}

/**
 * Formats decimal inches to fraction format like "20 1/2" or "2 5/8"
 * @param value - Decimal inches
 * @returns Formatted string with fractions
 */
export const formatDimension = (value: number | undefined): string => {
  if (value === undefined || value === null) return ''

  const whole = Math.floor(value)
  const fraction = value - whole

  if (fraction === 0) {
    return whole.toString()
  }

  // Common fractions for surfboard dimensions
  const commonFractions = [
    { decimal: 1 / 16, fraction: '1/16' },
    { decimal: 1 / 8, fraction: '1/8' },
    { decimal: 3 / 16, fraction: '3/16' },
    { decimal: 1 / 6, fraction: '1/6' },
    { decimal: 1 / 4, fraction: '1/4' },
    { decimal: 5 / 16, fraction: '5/16' },
    { decimal: 1 / 3, fraction: '1/3' },
    { decimal: 3 / 8, fraction: '3/8' },
    { decimal: 7 / 16, fraction: '7/16' },
    { decimal: 1 / 2, fraction: '1/2' },
    { decimal: 9 / 16, fraction: '9/16' },
    { decimal: 5 / 8, fraction: '5/8' },
    { decimal: 2 / 3, fraction: '2/3' },
    { decimal: 11 / 16, fraction: '11/16' },
    { decimal: 3 / 4, fraction: '3/4' },
    { decimal: 13 / 16, fraction: '13/16' },
    { decimal: 7 / 8, fraction: '7/8' },
    { decimal: 15 / 16, fraction: '15/16' },
  ]

  // Find closest matching fraction
  let closestFraction = commonFractions[0]
  let minDiff = Math.abs(fraction - closestFraction.decimal)

  for (const frac of commonFractions) {
    const diff = Math.abs(fraction - frac.decimal)
    if (diff < minDiff) {
      minDiff = diff
      closestFraction = frac
    }
  }

  // If the difference is small enough, use the fraction
  if (minDiff < 0.01) {
    if (whole === 0) {
      return closestFraction.fraction
    }
    return `${whole} ${closestFraction.fraction}`
  }

  // Otherwise return decimal
  return value.toFixed(2).replace(/\.?0+$/, '')
}

/**
 * Formats board type value to display label
 * @param value - Board type value (e.g., "shortboard", "longboard")
 * @returns Formatted label (e.g., "Shortboard", "Longboard")
 */
export const formatBoardType = (value: string | undefined): string => {
  if (!value) return ''

  const boardTypeMap: Record<string, string> = {
    shortboard: 'Shortboard',
    longboard: 'Longboard',
    fish: 'Fish',
    'mid-length': 'Mid-Length',
    funboard: 'Funboard',
    gun: 'Gun',
    hybrid: 'Hybrid',
    'soft-top': 'Soft-Top',
    other: 'Other',
  }

  return boardTypeMap[value.toLowerCase()] || value
}

/**
 * Formats fin setup value to display label
 * @param value - Fin setup value (e.g., "thruster", "quad")
 * @returns Formatted label (e.g., "Thruster", "Quad")
 */
export const formatFinSetup = (value: string | undefined): string => {
  if (!value) return ''

  const finSetupMap: Record<string, string> = {
    single: 'Single',
    twin: 'Twin',
    thruster: 'Thruster',
    quad: 'Quad',
    '5-fin': '5-Fin',
    other: 'Other',
  }

  return finSetupMap[value.toLowerCase()] || value
}
