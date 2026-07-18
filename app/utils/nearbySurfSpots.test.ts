import { describe, expect, it } from 'vitest'

import {
  AT_SPOT_RADIUS_KM,
  findSurfSpotAtCoordinates,
  formatNearbySpotDistance,
  formatSessionSpotDistanceLabel,
  type NearbySurfSpot,
} from './nearbySurfSpots'

const spotAt = (distanceKm: number, id = '1'): NearbySurfSpot =>
  ({
    id,
    name: 'Test spot',
    latitude: 0,
    longitude: 0,
    distanceKm,
  }) as NearbySurfSpot

describe('findSurfSpotAtCoordinates', () => {
  it('should return null when there are no nearby spots', () => {
    expect(findSurfSpotAtCoordinates([], { latitude: 0, longitude: 0 })).toBeNull()
  })

  it('should return the nearest spot when within the at-spot radius', () => {
    const nearest = spotAt(AT_SPOT_RADIUS_KM)
    expect(
      findSurfSpotAtCoordinates([nearest, spotAt(2, '2')], {
        latitude: 0,
        longitude: 0,
      }),
    ).toBe(nearest)
  })

  it('should return null when the nearest spot is farther than the at-spot radius', () => {
    expect(
      findSurfSpotAtCoordinates([spotAt(AT_SPOT_RADIUS_KM + 0.01)], {
        latitude: 0,
        longitude: 0,
      }),
    ).toBeNull()
  })
})

describe('formatNearbySpotDistance', () => {
  it('should format sub-kilometer distances in meters', () => {
    expect(formatNearbySpotDistance(0.25)).toBe('250 m')
  })

  it('should format kilometer distances with one decimal place', () => {
    expect(formatNearbySpotDistance(1.25)).toBe('1.3 km')
  })
})

describe('formatSessionSpotDistanceLabel', () => {
  it('should say at surfed location when very close', () => {
    expect(formatSessionSpotDistanceLabel(0.04)).toBe('At your surfed location')
  })

  it('should include distance from surfed location otherwise', () => {
    expect(formatSessionSpotDistanceLabel(1.2)).toBe(
      '1.2 km from your surfed location',
    )
  })
})
