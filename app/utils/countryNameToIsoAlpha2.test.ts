import { describe, expect, it } from 'vitest'

import type { SurfSpot } from '~/types/surfSpots'

import {
  countryNameToIsoAlpha2,
  getSurfedCountryIsoCodes,
} from './countryNameToIsoAlpha2'

const spotWithCountry = (name: string): SurfSpot =>
  ({ country: { name } }) as SurfSpot

describe('countryNameToIsoAlpha2', () => {
  it('maps common country names to ISO alpha-2', () => {
    expect(countryNameToIsoAlpha2('Portugal')).toBe('PT')
    expect(countryNameToIsoAlpha2('France')).toBe('FR')
    expect(countryNameToIsoAlpha2('United States')).toBe('US')
  })

  it('maps UK nations to GB for Mapbox fills', () => {
    expect(countryNameToIsoAlpha2('England')).toBe('GB')
    expect(countryNameToIsoAlpha2('Scotland')).toBe('GB')
    expect(countryNameToIsoAlpha2('Wales')).toBe('GB')
  })

  it('returns undefined for missing or unknown names', () => {
    expect(countryNameToIsoAlpha2()).toBeUndefined()
    expect(countryNameToIsoAlpha2('')).toBeUndefined()
    expect(countryNameToIsoAlpha2('Not A Real Country')).toBeUndefined()
  })
})

describe('getSurfedCountryIsoCodes', () => {
  it('returns unique sorted ISO codes from spots', () => {
    expect(
      getSurfedCountryIsoCodes([
        spotWithCountry('Portugal'),
        spotWithCountry('England'),
        spotWithCountry('Portugal'),
        spotWithCountry('Wales'),
        { } as SurfSpot,
      ]),
    ).toEqual(['GB', 'PT'])
  })
})
