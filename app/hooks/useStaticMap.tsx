import { MutableRefObject, useEffect, useRef } from 'react'
import { addMarkerForCoordinate, initializeMap } from '~/services/mapService'
import { Coordinates } from '~/types/surfSpots'

export const useStaticMap = (
  coordinates: Coordinates,
  mapContainer: MutableRefObject<HTMLDivElement | null>,
  setLoading: (value: boolean) => void,
) => {
  const mapRef = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!mapContainer.current) {
      return
    }

    // Initialize the map
    mapRef.current = initializeMap(mapContainer.current, false, coordinates)

    addMarkerForCoordinate(coordinates, mapRef.current)

    // Map loading event
    mapRef.current.on('load', () => setLoading(false))

    return () => mapRef.current?.remove()
  }, [])
}
