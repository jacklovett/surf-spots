import { useCallback, useEffect, useMemo, useState } from 'react'

import { useSettingsContext } from '~/contexts'
import { Coordinates } from '~/types/surfSpots'
import {
  fetchNearbySurfSpots,
  NearbySurfSpot,
} from '~/utils/nearbySurfSpots'
import { formatDistanceKm } from '~/utils/unitUtils'

export const UNKNOWN_SESSION_SPOT_LABEL = 'Unknown location'

export type EndSessionSpotLoadStatus =
  | 'loading'
  | 'ready'
  | 'error'
  | 'no-coordinates'

export interface EndSessionSpotViewModel {
  status: EndSessionSpotLoadStatus
  selectedSpotId: string
  selectedSpotName: string
  isUnknownLocation: boolean
  nearbySpots: NearbySurfSpot[]
  sessionCoordinates: Coordinates | null
  setSelectedSpotId: (spotId: string) => void
  confirmSpotSelection: (spotId: string) => void
  clearSpotSelection: () => void
  formatSpotOptionLabel: (spot: NearbySurfSpot) => string
  retryNearbySpots: () => void
}

interface UseEndSessionSpotResolutionParams {
  startLatitude?: number | null
  startLongitude?: number | null
  userId?: string
  initialSurfSpotId?: string | null
  initialSurfSpotName?: string | null
}

export const useEndSessionSpotResolution = (
  params: UseEndSessionSpotResolutionParams,
): EndSessionSpotViewModel => {
  const { startLatitude, startLongitude, userId, initialSurfSpotId, initialSurfSpotName } =
    params
  const { settings } = useSettingsContext()
  const { preferredUnits } = settings

  const normalizedInitialSurfSpotId = initialSurfSpotId?.trim() ?? ''

  const [nearbySpots, setNearbySpots] = useState<NearbySurfSpot[]>([])
  const [loadStatus, setLoadStatus] =
    useState<EndSessionSpotLoadStatus>('loading')
  const [selectedSpotId, setSelectedSpotIdState] = useState('')
  const [retryToken, setRetryToken] = useState(0)

  const sessionCoordinates = useMemo(() => {
    if (startLatitude == null || startLongitude == null) {
      return null
    }

    return {
      latitude: startLatitude,
      longitude: startLongitude,
    }
  }, [startLatitude, startLongitude])

  useEffect(() => {
    if (sessionCoordinates == null) {
      setNearbySpots([])
      setSelectedSpotIdState('')
      setLoadStatus('no-coordinates')
      return
    }

    let cancelled = false
    setLoadStatus('loading')

    fetchNearbySurfSpots(sessionCoordinates, userId)
      .then((spots) => {
        if (cancelled) {
          return
        }

        setNearbySpots(spots)

        if (normalizedInitialSurfSpotId !== '') {
          setSelectedSpotIdState(normalizedInitialSurfSpotId)
        } else {
          setSelectedSpotIdState('')
        }

        setLoadStatus('ready')
      })
      .catch(() => {
        if (!cancelled) {
          setNearbySpots([])
          setSelectedSpotIdState('')
          setLoadStatus('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [normalizedInitialSurfSpotId, retryToken, sessionCoordinates, userId])

  const selectedSpot = useMemo(
    () =>
      nearbySpots.find((spot) => spot.id != null && String(spot.id) === selectedSpotId) ??
      null,
    [nearbySpots, selectedSpotId],
  )

  const isUnknownLocation = loadStatus === 'ready' && selectedSpotId === ''

  const selectedSpotName =
    selectedSpot?.name ??
    (selectedSpotId !== '' && selectedSpotId === normalizedInitialSurfSpotId
      ? (initialSurfSpotName ?? 'Surf spot')
      : isUnknownLocation
        ? UNKNOWN_SESSION_SPOT_LABEL
        : '')

  const setSelectedSpotId = useCallback((spotId: string) => {
    setSelectedSpotIdState(spotId)
  }, [])

  const confirmSpotSelection = useCallback(
    (spotId: string): void => {
      const normalizedSpotId = spotId.trim()
      if (normalizedSpotId === '') {
        throw new Error('End session spot selection requires a spot id')
      }

      const matchingSpot =
        nearbySpots.find(
          (spot) => spot.id != null && String(spot.id) === normalizedSpotId,
        ) ?? null

      if (matchingSpot == null) {
        throw new Error('End session spot selection spot is no longer available')
      }

      setSelectedSpotIdState(normalizedSpotId)
    },
    [nearbySpots],
  )

  const clearSpotSelection = useCallback((): void => {
    setSelectedSpotIdState('')
  }, [])

  const formatSpotOptionLabel = useCallback(
    (spot: NearbySurfSpot) => {
      const spotName = spot.name ?? 'Surf spot'
      return `${spotName} (${formatDistanceKm(spot.distanceKm, preferredUnits)})`
    },
    [preferredUnits],
  )

  const retryNearbySpots = useCallback((): void => {
    setRetryToken((currentToken) => currentToken + 1)
  }, [])

  return {
    status: loadStatus,
    selectedSpotId,
    selectedSpotName,
    isUnknownLocation,
    nearbySpots,
    sessionCoordinates,
    setSelectedSpotId,
    confirmSpotSelection,
    clearSpotSelection,
    formatSpotOptionLabel,
    retryNearbySpots,
  }
}
