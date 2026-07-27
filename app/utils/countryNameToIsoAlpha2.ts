import countries from 'i18n-iso-countries'
import type { LocaleData } from 'i18n-iso-countries'
import english from 'i18n-iso-countries/langs/en.json'

import type { SurfSpot } from '~/types/surfSpots'

countries.registerLocale(english as LocaleData)

/** App seed lists UK nations separately; Mapbox country fills use GB. */
const UK_COUNTRY_NAMES = new Set([
  'england',
  'scotland',
  'wales',
  'northern ireland',
  'united kingdom',
  'uk',
  'great britain',
])

/** Short seed names that do not match i18n-iso-countries aliases. */
const COUNTRY_NAME_ALIASES: Record<string, string> = {
  brunei: 'BN',
  laos: 'LA',
  micronesia: 'FM',
  moldova: 'MD',
  syria: 'SY',
}

/**
 * Maps a country display name to ISO 3166-1 alpha-2 for Mapbox country fills.
 * Unknown names return undefined (no fill).
 */
export const countryNameToIsoAlpha2 = (countryName?: string): string | undefined => {
  const trimmed = countryName?.trim()
  if (!trimmed) {
    return undefined
  }
  const lower = trimmed.toLowerCase()
  if (UK_COUNTRY_NAMES.has(lower)) {
    return 'GB'
  }
  return countries.getAlpha2Code(trimmed, 'en') ?? COUNTRY_NAME_ALIASES[lower]
}

/** Unique ISO alpha-2 codes for countries present on the given surf spots. */
export const getSurfedCountryIsoCodes = (surfSpots: SurfSpot[]): string[] => {
  const codes = new Set<string>()
  for (const spot of surfSpots) {
    const code = countryNameToIsoAlpha2(spot.country?.name)
    if (code) {
      codes.add(code)
    }
  }
  return [...codes].sort()
}
