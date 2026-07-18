import { describe, expect, it } from 'vitest'

import {
  countryOptionMatchesQuery,
  filterCountrySelectOptions,
} from './countrySelectSearch'

describe('countryOptionMatchesQuery', () => {
  it('matches country name case-insensitively', () => {
    expect(
      countryOptionMatchesQuery({ value: 'US', label: 'United States' }, 'united'),
    ).toBe(true)
    expect(
      countryOptionMatchesQuery({ value: 'US', label: 'United States' }, 'france'),
    ).toBe(false)
  })

  it('matches dial code digits with or without leading plus', () => {
    expect(
      countryOptionMatchesQuery({ value: 'GB', label: 'United Kingdom' }, '44'),
    ).toBe(true)
    expect(
      countryOptionMatchesQuery({ value: 'GB', label: 'United Kingdom' }, '+44'),
    ).toBe(true)
  })

  it('matches dial codes that contain the query as a substring', () => {
    expect(
      countryOptionMatchesQuery({ value: 'AO', label: 'Angola' }, '44'),
    ).toBe(true)
    expect(
      countryOptionMatchesQuery({ value: 'AO', label: 'Angola' }, '244'),
    ).toBe(true)
  })

  it('matches ISO country code', () => {
    expect(countryOptionMatchesQuery({ value: 'PT', label: 'Portugal' }, 'pt')).toBe(
      true,
    )
  })

  it('rejects dividers when filtering', () => {
    expect(countryOptionMatchesQuery({ label: '', divider: true }, 'us')).toBe(false)
  })
})

describe('filterCountrySelectOptions', () => {
  const options = [
    { value: 'AO', label: 'Angola' },
    { value: 'US', label: 'United States' },
    { divider: true, label: '' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'AU', label: 'Australia' },
  ]

  it('returns all options when query is empty', () => {
    expect(filterCountrySelectOptions(options, '   ')).toEqual(options)
  })

  it('filters by name and drops dividers', () => {
    expect(filterCountrySelectOptions(options, 'united')).toEqual([
      { value: 'GB', label: 'United Kingdom' },
      { value: 'US', label: 'United States' },
    ])
  })

  it('filters by dial code', () => {
    expect(filterCountrySelectOptions(options, '61')).toEqual([
      { value: 'AU', label: 'Australia' },
    ])
  })

  it('ranks exact dial match before substring dial matches', () => {
    expect(filterCountrySelectOptions(options, '44')).toEqual([
      { value: 'GB', label: 'United Kingdom' },
      { value: 'AO', label: 'Angola' },
    ])
  })

  it('matches full dial code for substring-only countries', () => {
    expect(filterCountrySelectOptions(options, '244')).toEqual([
      { value: 'AO', label: 'Angola' },
    ])
  })
})
