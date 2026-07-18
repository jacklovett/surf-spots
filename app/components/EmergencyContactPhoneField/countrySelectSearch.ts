import { getCountryCallingCode } from 'libphonenumber-js'
import type { Country } from 'react-phone-number-input'

interface MatchableCountryOption {
  value?: string
  label: string
  divider?: boolean
}

export const safeCallingCode = (code: string | undefined): string => {
  if (!code || code === 'ZZ') {
    return ''
  }
  try {
    return getCountryCallingCode(code as Country)
  } catch {
    return ''
  }
}

const normalizeQuery = (query: string): string =>
  query.trim().toLowerCase().replace(/^\+/, '')

const queryDigitsOf = (normalizedQuery: string): string =>
  normalizedQuery.replace(/\D/g, '')

/** Dial match: exact, prefix, or substring (e.g. "44" hits +44 and +244). */
const dialMatchesQuery = (dial: string, normalizedQuery: string): boolean => {
  const queryDigits = queryDigitsOf(normalizedQuery)
  if (!queryDigits || !dial) {
    return false
  }
  return dial.includes(queryDigits)
}

/** True when query is empty or matches country name, ISO code, or dial digits. */
export const countryOptionMatchesQuery = (
  option: MatchableCountryOption,
  query: string,
): boolean => {
  if (option.divider) {
    return false
  }

  const normalized = normalizeQuery(query)
  if (!normalized) {
    return true
  }

  if (option.label.toLowerCase().includes(normalized)) {
    return true
  }

  const isoCode = option.value?.toLowerCase() ?? ''
  if (isoCode && isoCode.includes(normalized)) {
    return true
  }

  return dialMatchesQuery(safeCallingCode(option.value), normalized)
}

const matchRank = (option: MatchableCountryOption, normalized: string): number => {
  const dial = safeCallingCode(option.value)
  const queryDigits = queryDigitsOf(normalized)
  if (queryDigits && dial === queryDigits) {
    return 0
  }
  if (queryDigits && dial.startsWith(queryDigits)) {
    return 1
  }
  if (queryDigits && dial.includes(queryDigits)) {
    return 2
  }

  const label = option.label.toLowerCase()
  if (label.startsWith(normalized)) {
    return 3
  }
  if (label.includes(normalized)) {
    return 4
  }

  const isoCode = option.value?.toLowerCase() ?? ''
  if (isoCode.startsWith(normalized)) {
    return 5
  }
  return 6
}

export const filterCountrySelectOptions = <Option extends MatchableCountryOption>(
  options: Option[],
  query: string,
): Option[] => {
  const normalized = normalizeQuery(query)
  if (!normalized) {
    return options
  }

  return options
    .filter((option) => countryOptionMatchesQuery(option, normalized))
    .sort((left, right) => {
      const leftRank = matchRank(left, normalized)
      const rightRank = matchRank(right, normalized)
      if (leftRank !== rightRank) {
        return leftRank - rightRank
      }
      // Among dial hits, shorter codes first (+44 before +447-style).
      if (leftRank <= 2) {
        const dialDelta =
          safeCallingCode(left.value).length - safeCallingCode(right.value).length
        if (dialDelta !== 0) {
          return dialDelta
        }
      }
      return left.label.localeCompare(right.label)
    })
}
