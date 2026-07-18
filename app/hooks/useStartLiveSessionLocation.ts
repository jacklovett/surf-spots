import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'

import type { StartSessionMapRef } from '~/components/StartSessionMap'
import { Coordinates } from '~/types/surfSpots'
import { roundCoordinate } from '~/utils/coordinateUtils'
import {
  ERROR_GEOLOCATION_NOT_SUPPORTED,
  ERROR_LOCATION_FALLBACK,
  ERROR_LOCATION_PERMISSION_DENIED,
  ERROR_LOCATION_POSITION_UNAVAILABLE,
  ERROR_LOCATION_REQUEST_TIMEOUT,
} from '~/utils/errorUtils'

type GeolocationStatus = 'loading' | 'ready' | 'unavailable'

const geolocationOptions: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 60000,
}

export interface StartLiveSessionLocationViewModel {
  canStartSession: boolean
  coordinates: Coordinates | null
  mapRef: RefObject<StartSessionMapRef>
  map: {
    showUserLocationMarker: boolean
    allowManualPlacement: boolean
    instructionText: string | null
    onManualPlacement: (coordinates: Coordinates) => void
  }
  locationActions: {
    showUseMyLocation: boolean
    useMyLocationDisabled: boolean
    useMyLocationRequesting: boolean
    onUseMyLocation: () => void
  }
  status: {
    isGeolocationLoading: boolean
    isGeolocationUnavailable: boolean
    showManualPlacementRequired: boolean
  }
  hiddenFields: {
    startLatitude: number | null
    startLongitude: number | null
  }
  resetCoordinates: () => void
}

interface UseStartLiveSessionLocationParams {
  showError: (message: string) => void
}

export const useStartLiveSessionLocation = (
  params: UseStartLiveSessionLocationParams,
): StartLiveSessionLocationViewModel => {
  const { showError } = params
  const mapRef = useRef<StartSessionMapRef>(null)
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [geolocationStatus, setGeolocationStatus] =
    useState<GeolocationStatus>('loading')
  const [isRequestingUserLocation, setIsRequestingUserLocation] = useState(false)
  const [manualPlacementRequired, setManualPlacementRequired] = useState(false)

  const canStartSession = coordinates != null

  const requestUserCoordinates = useCallback(
    (onSuccess?: (coords: Coordinates) => void) => {
      if (!navigator.geolocation) {
        setGeolocationStatus('unavailable')
        setManualPlacementRequired(true)
        showError(ERROR_GEOLOCATION_NOT_SUPPORTED)
        return
      }

      setIsRequestingUserLocation(true)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            latitude: roundCoordinate(position.coords.latitude),
            longitude: roundCoordinate(position.coords.longitude),
          }
          setCoordinates(coords)
          setGeolocationStatus('ready')
          setManualPlacementRequired(false)
          setIsRequestingUserLocation(false)
          mapRef.current?.flyTo(coords)
          onSuccess?.(coords)
        },
        (error) => {
          setGeolocationStatus('unavailable')
          setManualPlacementRequired(true)
          setIsRequestingUserLocation(false)

          switch (error.code) {
            case error.PERMISSION_DENIED:
              showError(ERROR_LOCATION_PERMISSION_DENIED)
              break
            case error.POSITION_UNAVAILABLE:
              showError(ERROR_LOCATION_POSITION_UNAVAILABLE)
              break
            case error.TIMEOUT:
              showError(ERROR_LOCATION_REQUEST_TIMEOUT)
              break
            default:
              showError(ERROR_LOCATION_FALLBACK)
          }
        },
        geolocationOptions,
      )
    },
    [showError],
  )

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeolocationStatus('unavailable')
      setManualPlacementRequired(true)
      return
    }

    setGeolocationStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          latitude: roundCoordinate(position.coords.latitude),
          longitude: roundCoordinate(position.coords.longitude),
        }
        setCoordinates(coords)
        setGeolocationStatus('ready')
        setManualPlacementRequired(false)
      },
      () => {
        setGeolocationStatus('unavailable')
        setManualPlacementRequired(true)
      },
      geolocationOptions,
    )
  }, [])

  const handleManualPlacement = useCallback((coords: Coordinates) => {
    setCoordinates(coords)
    setManualPlacementRequired(false)
    mapRef.current?.flyTo(coords)
  }, [])

  const resetCoordinates = useCallback(() => {
    setCoordinates(null)
    setManualPlacementRequired(geolocationStatus === 'unavailable')
  }, [geolocationStatus])

  const hiddenFields = useMemo(
    () => ({
      startLatitude: coordinates?.latitude ?? null,
      startLongitude: coordinates?.longitude ?? null,
    }),
    [coordinates],
  )

  const allowManualPlacement =
    manualPlacementRequired || (geolocationStatus === 'unavailable' && coordinates == null)

  const instructionText = allowManualPlacement
    ? 'Click the map to set your starting location.'
    : coordinates != null
      ? null
      : 'Getting your location…'

  return {
    canStartSession,
    coordinates,
    mapRef: mapRef as RefObject<StartSessionMapRef>,
    map: {
      showUserLocationMarker: coordinates != null,
      allowManualPlacement,
      instructionText,
      onManualPlacement: handleManualPlacement,
    },
    locationActions: {
      showUseMyLocation: geolocationStatus === 'unavailable',
      useMyLocationDisabled: isRequestingUserLocation,
      useMyLocationRequesting: isRequestingUserLocation,
      onUseMyLocation: () => requestUserCoordinates(),
    },
    status: {
      isGeolocationLoading: geolocationStatus === 'loading' && coordinates == null,
      isGeolocationUnavailable: geolocationStatus === 'unavailable',
      showManualPlacementRequired:
        allowManualPlacement && coordinates == null,
    },
    hiddenFields,
    resetCoordinates,
  }
}
