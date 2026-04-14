import countries from 'i18n-iso-countries'
import type { LocaleData } from 'i18n-iso-countries'
import english from 'i18n-iso-countries/langs/en.json'
import type { Country } from 'react-phone-number-input'

/**
 * Maps profile location country names (same strings as `cities_countries.json`) to ISO 3166-1 alpha-2
 * for `react-phone-number-input` `defaultCountry`. Falls back to US when unknown.
 */
countries.registerLocale(english as LocaleData)

export const countryNameToPhoneDefaultCountry = (countryName: string): Country => {
  const trimmed = countryName?.trim()
  if (!trimmed) {
    return 'US'
  }
  const alpha2 = countries.getAlpha2Code(trimmed, 'en')
  return (alpha2 ?? 'US') as Country
}
