import {
  useRef,
  useState,
  memo,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react'
import classNames from 'classnames'
import mapboxgl from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css'

import SkeletonLoader from '../SkeletonLoader'
import { Coordinates } from '~/types/surfSpots'
import { initializeMap, createPinElement } from '~/services/mapService'

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
    const [loading, setLoading] = useState(true)
    const [map, setMap] = useState<mapboxgl.Map | null>(null)
    const mapContainerRef = useRef<HTMLDivElement | null>(null)
    const markerRef = useRef<mapboxgl.Marker | null>(null)

    // Add draggable marker to map
    const addPinToMap = useCallback(
      (coordinates: Coordinates) => {
        if (!map) return

        // Remove existing marker if any
        if (markerRef.current) {
          markerRef.current.remove()
        }

        const pinElement = createPinElement(32)
        pinElement.style.cursor = 'grab'

        // Create draggable marker with custom element
        const marker = new mapboxgl.Marker({
          element: pinElement,
          draggable: true,
        })
          .setLngLat([coordinates.longitude, coordinates.latitude])
          .addTo(map)

        // Handle marker drag events
        marker.on('dragstart', () => {
          pinElement.style.cursor = 'grabbing'
          // Disable page scrolling while dragging using CSS
          document.body.style.overflow = 'hidden'
          document.body.style.touchAction = 'none'
        })

        marker.on('drag', () => {
          const lngLat = marker.getLngLat()
          const mapContainer = map.getContainer()
          const mapSize = {
            width: mapContainer.clientWidth,
            height: mapContainer.clientHeight,
          }

          // Calculate if we need to pan the map
          const point = map.project([lngLat.lng, lngLat.lat])
          const panThreshold = 50 // pixels from edge to start panning
          const panSpeed = 8 // pixels per frame - reduced for smoother movement

          let panX = 0
          let panY = 0

          // Check if marker is near the left edge
          if (point.x < panThreshold) {
            panX = -panSpeed
          }
          // Check if marker is near the right edge
          else if (point.x > mapSize.width - panThreshold) {
            panX = panSpeed
          }

          // Check if marker is near the top edge
          if (point.y < panThreshold) {
            panY = -panSpeed
          }
          // Check if marker is near the bottom edge
          else if (point.y > mapSize.height - panThreshold) {
            panY = panSpeed
          }

          // Pan the map if needed - directly without requestAnimationFrame
          if (panX !== 0 || panY !== 0) {
            map.panBy([panX, panY], { duration: 0 })
          }
        })

        marker.on('dragend', () => {
          pinElement.style.cursor = 'grab'
          // Re-enable page scrolling after drag ends
          document.body.style.overflow = ''
          document.body.style.touchAction = ''
          const lngLat = marker.getLngLat()
          const newCoords: Coordinates = {
            longitude: lngLat.lng,
            latitude: lngLat.lat,
          }
          onLocationUpdate(newCoords)
        })

        markerRef.current = marker

        // Pan map to the new location
        map.flyTo({
          center: [coordinates.longitude, coordinates.latitude],
          zoom: 14,
          duration: 2000,
        })
      },
      [map, onLocationUpdate],
    )

    // Expose addPinToMap function to parent component
    useImperativeHandle(
      ref,
      () => ({
        addPinToMap,
      }),
      [addPinToMap],
    )

    // Initialize map when component mounts
    useEffect(() => {
      if (!mapContainerRef.current || map) return

      const mapInstance = initializeMap(
        mapContainerRef.current,
        true, // interactive
        initialCoordinates,
      )

      // Add navigation controls
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right')

      mapInstance.on('load', () => {
        setLoading(false)
        setMap(mapInstance)

        // Notify parent that map is ready
        if (onMapReady) {
          onMapReady(true)
        }

        // Add a default pin at map center if no initial coordinates
        if (!initialCoordinates) {
          const center = mapInstance.getCenter()
          const coords: Coordinates = {
            longitude: center.lng,
            latitude: center.lat,
          }
          onLocationUpdate(coords)
          addPinToMap(coords)
        }
      })

      // Handle map click to place pin
      mapInstance.on('click', (e) => {
        const coords: Coordinates = {
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat,
        }
        onLocationUpdate(coords)
        addPinToMap(coords)
      })

      // Cleanup on unmount
      return () => {
        mapInstance.remove()
        setMap(null)
        if (onMapReady) {
          onMapReady(false)
        }
      }
    }, []) // Empty dependency array - only run once on mount

    // Track previous coordinates to avoid unnecessary re-renders
    const previousCoordsRef = useRef<Coordinates | null>(null)

    // Add initial pin when map is ready and coordinates are provided
    useEffect(() => {
      if (!map || !initialCoordinates) return

      // Only update if coordinates have actually changed
      const coordsChanged =
        !previousCoordsRef.current ||
        previousCoordsRef.current.longitude !== initialCoordinates.longitude ||
        previousCoordsRef.current.latitude !== initialCoordinates.latitude

      if (coordsChanged) {
        previousCoordsRef.current = initialCoordinates
        addPinToMap(initialCoordinates)
      }
    }, [map, initialCoordinates, addPinToMap])

    return (
      <div className={classNames({ 'map-container': true, border: !loading })}>
        <div
          ref={mapContainerRef}
          className={classNames({
            map: true,
            'map-visible': !loading,
          })}
        />
        {/* Skeleton Loader shown on top of the map while loading */}
        {loading && <SkeletonLoader />}

        {/* Instructions overlay */}
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

AddSurfSpotMap.displayName = 'AddSurfSpotMap'
