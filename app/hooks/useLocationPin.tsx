import { useCallback, useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { Coordinates } from '~/types/surfSpots'

interface UseLocationPinProps {
  map: mapboxgl.Map | null
  onLocationUpdate: (coordinates: Coordinates) => void
}

export const useLocationPin = ({
  map,
  onLocationUpdate,
}: UseLocationPinProps) => {
  const [isLocating, setIsLocating] = useState(false)
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const [pinLocation, setPinLocation] = useState<Coordinates | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  // Get user's current location
  const getUserLocation = useCallback(() => {
    setIsLocating(true)

    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser')
      setIsLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        }
        setUserLocation(coords)
        setPinLocation(coords)
        onLocationUpdate(coords)
        setIsLocating(false)

        // Center map on user location
        if (map) {
          map.flyTo({
            center: [coords.longitude, coords.latitude],
            zoom: 14,
            duration: 2000,
          })
        }
      },
      (error) => {
        console.error('Error getting user location:', error)
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }, [map, onLocationUpdate])

  // Add draggable marker to map
  const addPinToMap = useCallback(
    (coordinates: Coordinates) => {
      if (!map) return

      // Remove existing marker if any
      if (markerRef.current) {
        markerRef.current.remove()
      }

      // Create draggable marker
      const marker = new mapboxgl.Marker({
        draggable: true,
        color: '#007cbf', // Blue color to distinguish from surf spot markers
      })
        .setLngLat([coordinates.longitude, coordinates.latitude])
        .addTo(map)

      // Handle marker drag events
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
        const lngLat = marker.getLngLat()
        const newCoords: Coordinates = {
          longitude: lngLat.lng,
          latitude: lngLat.lat,
        }
        setPinLocation(newCoords)
        onLocationUpdate(newCoords)
      })

      markerRef.current = marker
    },
    [map, onLocationUpdate],
  )

  // Remove pin from map
  const removePinFromMap = useCallback(() => {
    if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }
    setPinLocation(null)
    setUserLocation(null)
  }, [])

  // Add pin to map when map is ready and pin location is set
  useEffect(() => {
    if (map && pinLocation) {
      addPinToMap(pinLocation)
    }
  }, [map, pinLocation, addPinToMap])

  // Cleanup marker on unmount
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.remove()
      }
    }
  }, [])

  return {
    isLocating,
    userLocation,
    pinLocation,
    getUserLocation,
    removePinFromMap,
    addPinToMap,
  }
}
