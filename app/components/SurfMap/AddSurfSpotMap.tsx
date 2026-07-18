import {
  useRef,
  memo,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react'
import classNames from 'classnames'
import { Map, MapMouseEvent } from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css'

import SkeletonLoader from '../SkeletonLoader'
import { Coordinates } from '~/types/surfSpots'
import {
  defaultMapCenter,
  setDraggablePinAtCoordinates,
} from '~/services/mapService'
import { roundCoordinate } from '~/utils/coordinateUtils'
import { useMapInstance } from '~/hooks/useMapInstance'

interface AddSurfSpotMapProps {
  onLocationUpdate: (coordinates: Coordinates) => void
  initialCoordinates?: Coordinates
  onMapReady?: (isReady: boolean) => void
}

export interface AddSurfSpotMapRef {
  addPinToMap: (coordinates: Coordinates) => void
}

export const AddSurfSpotMap = memo(
  forwardRef<AddSurfSpotMapRef, AddSurfSpotMapProps>((props, ref) => {
    const { onLocationUpdate, initialCoordinates, onMapReady } = props
    const markerRef = useRef<mapboxgl.Marker | null>(null)
    const onLocationUpdateRef = useRef(onLocationUpdate)
    const onMapReadyRef = useRef(onMapReady)
    const initialCoordinatesRef = useRef(initialCoordinates)
    const addPinToMapRef = useRef<(coordinates: Coordinates) => void>(() => {})
    const previousCoordsRef = useRef<Coordinates | null>(null)

    onLocationUpdateRef.current = onLocationUpdate
    onMapReadyRef.current = onMapReady
    initialCoordinatesRef.current = initialCoordinates

    const handleMapClick = useCallback((event: MapMouseEvent) => {
      const coords: Coordinates = {
        longitude: roundCoordinate(event.lngLat.lng),
        latitude: roundCoordinate(event.lngLat.lat),
      }
      onLocationUpdateRef.current(coords)
      addPinToMapRef.current(coords)
    }, [])

    const handleMapLoad = useCallback(
      (map: Map) => {
        map.on('click', handleMapClick)
        onMapReadyRef.current?.(true)

        if (initialCoordinatesRef.current == null) {
          const center = map.getCenter()
          const coords: Coordinates = {
            longitude: roundCoordinate(center.lng),
            latitude: roundCoordinate(center.lat),
          }
          onLocationUpdateRef.current(coords)
          addPinToMapRef.current(coords)
        }
      },
      [handleMapClick],
    )

    const handleMapCleanup = useCallback(
      (map: Map) => {
        map.off('click', handleMapClick)
        if (markerRef.current) {
          markerRef.current.remove()
          markerRef.current = null
        }
        onMapReadyRef.current?.(false)
      },
      [handleMapClick],
    )

    const { mapContainerRef, mapRef, loading } = useMapInstance({
      interactive: true,
      initialCenter: initialCoordinates ?? defaultMapCenter,
      onLoad: handleMapLoad,
      onCleanup: handleMapCleanup,
    })

    const addPinToMap = useCallback(
      (coordinates: Coordinates) => {
        const map = mapRef.current
        if (map == null || map._removed) {
          return
        }

        setDraggablePinAtCoordinates(
          map,
          markerRef,
          coordinates,
          (nextCoordinates) => onLocationUpdateRef.current(nextCoordinates),
        )
      },
      [mapRef],
    )

    addPinToMapRef.current = addPinToMap

    useImperativeHandle(
      ref,
      () => ({
        addPinToMap,
      }),
      [addPinToMap],
    )

    useEffect(() => {
      if (loading || initialCoordinates == null) {
        return
      }

      const coordsChanged =
        previousCoordsRef.current == null ||
        previousCoordsRef.current.longitude !== initialCoordinates.longitude ||
        previousCoordsRef.current.latitude !== initialCoordinates.latitude

      if (coordsChanged) {
        previousCoordsRef.current = initialCoordinates
        addPinToMap(initialCoordinates)
      }
    }, [addPinToMap, initialCoordinates, loading])

    return (
      <div className={classNames({ 'map-container': true, border: !loading })}>
        <div
          ref={mapContainerRef}
          className={classNames({
            map: true,
            'map-visible': !loading,
          })}
        />
        {loading && <SkeletonLoader />}
        {!loading && (
          <div className="map-instructions-overlay">
            Click on the map to place your surf spot, and drag the pin to move
            it
          </div>
        )}
      </div>
    )
  }),
)

