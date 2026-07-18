import { describe, expect, it } from 'vitest'

import {
  directionArrayToString,
  directionStringToArray,
  sessionDirectionStoredToArray,
} from './surfSpotUtils'

describe('directionStringToArray', () => {
  it('should expand a normal range and a wrap-around range', () => {
    expect(directionStringToArray('N-E')).toEqual(['N', 'NE', 'E'])
    expect(directionStringToArray('NW-NE')).toEqual(['NW', 'N', 'NE'])
    expect(directionStringToArray('SW')).toEqual(['SW'])
  })
})

describe('directionArrayToString', () => {
  it('should collapse ranges to start-end', () => {
    expect(directionArrayToString(['N', 'NE', 'E'])).toBe('N-E')
    expect(directionArrayToString(['W'])).toBe('W')
    expect(directionArrayToString([])).toBe('')
  })
})

describe('sessionDirectionStoredToArray', () => {
  it('should support hyphen ranges and comma lists', () => {
    expect(sessionDirectionStoredToArray('N-E')).toEqual(['N', 'NE', 'E'])
    expect(sessionDirectionStoredToArray('N, NE, E')).toEqual(['N', 'NE', 'E'])
    expect(sessionDirectionStoredToArray(null)).toEqual([])
  })
})
