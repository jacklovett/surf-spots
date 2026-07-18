import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import classNames from 'classnames'
import { Map, MapMouseEvent, Marker } from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css'

import SkeletonLoader from '../SkeletonLoader'
import { Coordinates } from '~/types/surfSpots'
import {
  defaultMapCenter,
  createDomMarkerElement,
  syncDomMarkerAtCoordinates,
} from '~/services/mapService'
import { roundCoordinate } from '~/utils/coordinateUtils'
import { useMapInstance } from '~/hooks/useMapInstance'
import { ERROR_BOUNDARY_MAP } from '~/utils/errorUtils'
import { ErrorBoundary } from '~/components'

export interface StartSessionMapRef {
  flyTo: (coordinates: Coordinates) => void
}

interface StartSessionMapProps {
  userCoordinates: Coordinates | null
  showUserLocationMarker?: boolean
  instructionText: string | null
  allowManualPlacement?: boolean
  onManualPlacement?: (coordinates: Coordinates) => void
}

export const StartSessionMap = memo(
  forwardRef<StartSessionMapRef, StartSessionMapProps>((props, ref) => {
    const {
      userCoordinates,
      showUserLocationMarker = false,
      instructionText = null,
      allowManualPlacement = false,
      onManualPlacement,
    } = props

    const userMarkerRef = useRef<Marker | null>(null)
    const userCoordinatesRef = useRef(userCoordinates)
    const onManualPlacementRef = useRef(onManualPlacement)
    const allowManualPlacementRef = useRef(allowManualPlacement)

    userCoordinatesRef.current = userCoordinates
    onManualPlacementRef.current = onManualPlacement
    allowManualPlacementRef.current = allowManualPlacement

    const handleMapClick = useCallback((event: MapMouseEvent) => {
      if (
        !allowManualPlacementRef.current ||
        onManualPlacementRef.current == null
      ) {
        return
      }

      onManualPlacementRef.current({
        latitude: roundCoordinate(event.lngLat.lat),
        longitude: roundCoordinate(event.lngLat.lng),
      })
    }, [])

    const flyToOnMap = useCallback(
      (map: Map, coordinates: Coordinates) => {
        if (map._removed) {
          return
        }

        map.flyTo({
          center: [coordinates.longitude, coordinates.latitude],
          zoom: 13,
          duration: 1200,
        })
      },
      [],
    )

    const handleMapLoad = useCallback(
      (map: Map) => {
        map.on('click', handleMapClick)
        if (userCoordinatesRef.current != null) {
          flyToOnMap(map, userCoordinatesRef.current)
        }
      },
      [flyToOnMap, handleMapClick],
    )

    const handleMapCleanup = useCallback(
      (map: Map) => {
        map.off('click', handleMapClick)
        if (userMarkerRef.current) {
          userMarkerRef.current.remove()
          userMarkerRef.current = null
        }
      },
      [handleMapClick],
    )

    const { mapContainerRef, mapRef, loading } = useMapInstance({
      interactive: true,
      initialCenter: userCoordinates ?? defaultMapCenter,
      onLoad: handleMapLoad,
      onCleanup: handleMapCleanup,
    })

    const flyTo = useCallback(
      (coordinates: Coordinates) => {
        const map = mapRef.current
        if (map == null) {
          return
        }
        flyToOnMap(map, coordinates)
      },
      [flyToOnMap, mapRef],
    )

    useImperativeHandle(
      ref,
      () => ({
        flyTo,
      }),
      [flyTo],
    )

    useEffect(() => {
      const map = mapRef.current
      if (
        map == null ||
        map._removed ||
        loading ||
        userCoordinates == null ||
        !showUserLocationMarker
      ) {
        if (userMarkerRef.current) {
          userMarkerRef.current.remove()
          userMarkerRef.current = null
        }
        return
      }

      syncDomMarkerAtCoordinates(map, userMarkerRef, userCoordinates, () =>
        createDomMarkerElement('map-marker-dot', { ariaHidden: true }),
      )
      flyTo(userCoordinates)
    }, [flyTo, loading, mapRef, showUserLocationMarker, userCoordinates])

    return (
      <ErrorBoundary message={ERROR_BOUNDARY_MAP}>
        <div className={classNames('map-container', { border: !loading })}>
          <div
            ref={mapContainerRef}
            className={classNames('map', { 'map-visible': !loading })}
            role={allowManualPlacement ? 'application' : undefined}
            aria-label={
              allowManualPlacement
                ? 'Map for setting your starting location. Click the map to place your location.'
                : undefined
            }
            tabIndex={allowManualPlacement ? 0 : undefined}
          />
          {loading && <SkeletonLoader />}
          {!loading && instructionText != null && instructionText !== '' && (
            <div className="map-instructions-overlay">{instructionText}</div>
          )}
        </div>
      </ErrorBoundary>
    )
  }),
)

export default StartSessionMap
