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
import {
  initializeMap,
  createPinElement,
  defaultMapCenter,
} from '~/services/mapService'

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
    const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
    const [locationFetched, setLocationFetched] = useState(false)
    const mapContainerRef = useRef<HTMLDivElement | null>(null)
    const markerRef = useRef<mapboxgl.Marker | null>(null)
    const hasInitializedRef = useRef(false)
    // Store callbacks in refs to prevent re-initialization
    const onLocationUpdateRef = useRef(onLocationUpdate)
    const onMapReadyRef = useRef(onMapReady)

    // Update refs when callbacks change
    useEffect(() => {
      onLocationUpdateRef.current = onLocationUpdate
      onMapReadyRef.current = onMapReady
    }, [onLocationUpdate, onMapReady])

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
          onLocationUpdateRef.current(newCoords)
        })

        markerRef.current = marker

        // Pan map to the new location
        map.flyTo({
          center: [coordinates.longitude, coordinates.latitude],
          zoom: 14,
          duration: 2000,
        })
      },
      [map],
    )

    // Expose addPinToMap function to parent component
    useImperativeHandle(
      ref,
      () => ({
        addPinToMap,
      }),
      [addPinToMap],
    )

    // Fetch user's location on mount (only if no initial coordinates provided - i.e., add mode)
    useEffect(() => {
      if (initialCoordinates || locationFetched) return

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              longitude: position.coords.longitude,
              latitude: position.coords.latitude,
            })
            setLocationFetched(true)
          },
          (error) => {
            console.error('Error getting user location:', error)
            // Fall back to default location
            setUserLocation(defaultMapCenter)
            setLocationFetched(true)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          },
        )
      } else {
        // Geolocation not supported, use default location
        setUserLocation(defaultMapCenter)
        setLocationFetched(true)
      }
    }, [initialCoordinates, locationFetched])

    // Initialize map when component mounts
    useEffect(() => {
      if (!mapContainerRef.current || map || hasInitializedRef.current) return

      // Determine initial coordinates:
      // - Edit mode: use initialCoordinates (surf spot's existing location)
      // - Add mode: wait for user location, then use that or default
      let initialCoords: Coordinates | undefined

      if (initialCoordinates) {
        // Edit mode: use the surf spot's existing location immediately
        initialCoords = initialCoordinates
      } else {
        // Add mode: wait for user location to be fetched
        if (!locationFetched) {
          return
        }
        // Use user location or default
        initialCoords = userLocation || defaultMapCenter
      }

      // Mark as initialized to prevent re-initialization
      hasInitializedRef.current = true

      const mapInstance = initializeMap(
        mapContainerRef.current,
        true, // interactive
        initialCoords,
      )

      // Add navigation controls
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right')

      // Add geolocate control (re-center button)
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: false, // Don't track continuously, just center on click
        showUserHeading: false,
      })
      mapInstance.addControl(geolocateControl, 'top-right')

      // Helper function to add pin using the map instance directly
      const addPinToMapInstance = (coordinates: Coordinates) => {
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
          .addTo(mapInstance)

        // Handle marker drag events
        marker.on('dragstart', () => {
          pinElement.style.cursor = 'grabbing'
          document.body.style.overflow = 'hidden'
          document.body.style.touchAction = 'none'
        })

        marker.on('drag', () => {
          const lngLat = marker.getLngLat()
          const mapContainer = mapInstance.getContainer()
          const mapSize = {
            width: mapContainer.clientWidth,
            height: mapContainer.clientHeight,
          }

          const point = mapInstance.project([lngLat.lng, lngLat.lat])
          const panThreshold = 50
          const panSpeed = 8

          let panX = 0
          let panY = 0

          if (point.x < panThreshold) {
            panX = -panSpeed
          } else if (point.x > mapSize.width - panThreshold) {
            panX = panSpeed
          }

          if (point.y < panThreshold) {
            panY = -panSpeed
          } else if (point.y > mapSize.height - panThreshold) {
            panY = panSpeed
          }

          if (panX !== 0 || panY !== 0) {
            mapInstance.panBy([panX, panY], { duration: 0 })
          }
        })

        marker.on('dragend', () => {
          pinElement.style.cursor = 'grab'
          document.body.style.overflow = ''
          document.body.style.touchAction = ''
          const lngLat = marker.getLngLat()
          const newCoords: Coordinates = {
            longitude: lngLat.lng,
            latitude: lngLat.lat,
          }
          onLocationUpdateRef.current(newCoords)
        })

        markerRef.current = marker

        // Pan map to the new location
        mapInstance.flyTo({
          center: [coordinates.longitude, coordinates.latitude],
          zoom: 14,
          duration: 2000,
        })
      }

      mapInstance.on('load', () => {
        setLoading(false)
        setMap(mapInstance)

        // Notify parent that map is ready
        if (onMapReadyRef.current) {
          onMapReadyRef.current(true)
        }

        // Handle geolocate events to update pin location
        geolocateControl.on('geolocate', (e: any) => {
          const coords: Coordinates = {
            longitude: e.coords.longitude,
            latitude: e.coords.latitude,
          }
          onLocationUpdateRef.current(coords)
          // Use setTimeout to ensure map is ready after geolocate animation
          setTimeout(() => {
            addPinToMapInstance(coords)
          }, 100)
        })

        // Add a default pin at map center (using initialCoords we already set)
        const centerCoords: Coordinates = {
          longitude: initialCoords.longitude,
          latitude: initialCoords.latitude,
        }
        onLocationUpdateRef.current(centerCoords)
        addPinToMapInstance(centerCoords)
      })

      // Handle map click to place pin
      mapInstance.on('click', (e) => {
        const coords: Coordinates = {
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat,
        }
        onLocationUpdateRef.current(coords)
        addPinToMapInstance(coords)
      })

      // Cleanup on unmount
      return () => {
        mapInstance.remove()
        setMap(null)
        hasInitializedRef.current = false
        if (onMapReadyRef.current) {
          onMapReadyRef.current(false)
        }
      }
    }, [
      // Only depend on coordinate values, not callback functions
      initialCoordinates?.longitude,
      initialCoordinates?.latitude,
      userLocation?.longitude,
      userLocation?.latitude,
      locationFetched,
    ])

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
