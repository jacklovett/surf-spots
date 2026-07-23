import { describe, expect, it } from 'vitest'

import {
  convertSurfHeightToDisplay,
  convertSurfHeightToStored,
  formatDistanceKm,
  parsePreferredUnits,
} from './unitUtils'

describe('parsePreferredUnits', () => {
  it('should accept known unit values', () => {
    expect(parsePreferredUnits('metric')).toBe('metric')
    expect(parsePreferredUnits('imperial')).toBe('imperial')
  })

  it('should reject missing or unknown values', () => {
    expect(parsePreferredUnits(null)).toBeNull()
    expect(parsePreferredUnits(undefined)).toBeNull()
    expect(parsePreferredUnits('')).toBeNull()
    expect(parsePreferredUnits('us')).toBeNull()
  })
})

describe('formatDistanceKm', () => {
  it('should format sub-kilometer distances in meters', () => {
    expect(formatDistanceKm(0.25)).toBe('250 m')
  })

  it('should format kilometer distances with one decimal place', () => {
    expect(formatDistanceKm(1.25)).toBe('1.3 km')
  })

  it('should format sub-mile distances in feet when imperial', () => {
    expect(formatDistanceKm(0.25, 'imperial')).toBe('820 ft')
  })

  it('should format mile-and-above distances in miles when imperial', () => {
    expect(formatDistanceKm(1.609344, 'imperial')).toBe('1.0 mi')
  })

  it('should keep sub-mile imperial distances in feet', () => {
    // 1.25 km ≈ 0.78 mi — still under 1 mile, so feet
    expect(formatDistanceKm(1.25, 'imperial')).toBe('4101 ft')
  })
})

describe('convertSurfHeightToDisplay', () => {
  it('should leave meters unchanged when metric', () => {
    expect(convertSurfHeightToDisplay(1.2, 'metric')).toBe(1.2)
  })

  it('should convert meters to whole feet when imperial', () => {
    expect(convertSurfHeightToDisplay(2, 'imperial')).toBe(7)
  })
})

describe('convertSurfHeightToStored', () => {
  it('should leave meters unchanged when metric', () => {
    expect(convertSurfHeightToStored(1.2, 'metric')).toBe(1.2)
  })

  it('should convert feet back to meters when imperial', () => {
    expect(convertSurfHeightToStored(7, 'imperial')).toBeCloseTo(2.13, 2)
  })
})
