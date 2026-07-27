import type { Country } from 'react-phone-number-input'

import { countryNameToIsoAlpha2 } from './countryNameToIsoAlpha2'

/**
 * Maps profile location country names to ISO 3166-1 alpha-2 for
 * `react-phone-number-input` `defaultCountry`. Falls back to US when unknown.
 */
export const countryNameToPhoneDefaultCountry = (countryName: string): Country =>
  (countryNameToIsoAlpha2(countryName) ?? 'US') as Country
