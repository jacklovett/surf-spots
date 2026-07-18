import { post } from '~/services/networkService'
import { calculateDistance } from '~/services/mapService'
import { BoundingBox, Coordinates, SurfSpot } from '~/types/surfSpots'

export const NEARBY_SPOTS_RADIUS_KM = 25
export const NEARBY_SPOTS_LIMIT = 12
/** Within this distance we treat the user as at the spot (not GPS-only). */
export const AT_SPOT_RADIUS_KM = 0.5

export interface NearbySurfSpot extends SurfSpot {
  distanceKm: number
}

export const findSurfSpotAtCoordinates = (
  nearbySpots: NearbySurfSpot[],
  coordinates: Coordinates,
  radiusKm: number = AT_SPOT_RADIUS_KM,
): NearbySurfSpot | null => {
  if (nearbySpots.length === 0) {
    return null
  }

  const nearestSpot = nearbySpots[0]
  if (nearestSpot.distanceKm <= radiusKm) {
    return nearestSpot
  }

  return null
}

export const buildBoundingBoxAroundCoordinates = (
  coordinates: Coordinates,
  radiusKm: number,
): BoundingBox => {
  const latitudeDelta = radiusKm / 111
  const longitudeScale = Math.max(Math.cos((coordinates.latitude * Math.PI) / 180), 0.1)
  const longitudeDelta = radiusKm / (111 * longitudeScale)

  return {
    minLatitude: coordinates.latitude - latitudeDelta,
    maxLatitude: coordinates.latitude + latitudeDelta,
    minLongitude: coordinates.longitude - longitudeDelta,
    maxLongitude: coordinates.longitude + longitudeDelta,
  }
}

export const fetchNearbySurfSpots = async (
  coordinates: Coordinates,
  userId?: string,
): Promise<NearbySurfSpot[]> => {
  const boundingBox = buildBoundingBoxAroundCoordinates(
    coordinates,
    NEARBY_SPOTS_RADIUS_KM,
  )

  const payload: BoundingBox & { userId?: string } = { ...boundingBox }
  if (userId != null && userId.trim() !== '') {
    payload.userId = userId
  }

  const response = await post<BoundingBox & { userId?: string }, SurfSpot[]>(
    'surf-spots/within-bounds',
    payload,
  )

  const spots = response?.data ?? []

  return spots
    .filter(
      (spot) =>
        spot.latitude != null &&
        spot.longitude != null &&
        spot.id != null,
    )
    .map((spot) => ({
      ...spot,
      distanceKm: calculateDistance(
        coordinates.latitude,
        coordinates.longitude,
        spot.latitude as number,
        spot.longitude as number,
      ),
    }))
    .sort((left, right) => left.distanceKm - right.distanceKm)
    .slice(0, NEARBY_SPOTS_LIMIT)
}

export const formatNearbySpotDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`
  }
  return `${distanceKm.toFixed(1)} km`
}

/** Distance from the live session start to a nearby spot, for end-session spot picking. */
export const formatSessionSpotDistanceLabel = (distanceKm: number): string => {
  if (distanceKm < 0.05) {
    return 'At your surfed location'
  }
  return `${formatNearbySpotDistance(distanceKm)} from your surfed location`
}
