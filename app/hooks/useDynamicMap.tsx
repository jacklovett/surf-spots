import mapboxgl from 'mapbox-gl'
import { MutableRefObject, useEffect, useRef, useState } from 'react'
import {
  addMarkersForSurfSpots,
  defaultMapCenter,
  MAP_ACCESS_TOKEN,
} from '~/services/mapService'
import { Coordinates, SurfSpot } from '~/types/surfSpots'

export const useDynamicMap = (
  surfSpots: SurfSpot[],
  mapContainer: MutableRefObject<HTMLDivElement | null>,
  setLoading: (value: boolean) => void,
) => {
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [userLocation, setUserLocation] =
    useState<Coordinates>(defaultMapCenter)

  // Gather user location so we can set map based on their location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => setUserLocation(position.coords),
      (error) => console.error('Error getting user location:', error),
    )
  }, [])

  useEffect(() => {
    mapboxgl.accessToken = MAP_ACCESS_TOKEN

    // Initialize the map
    mapRef.current = new mapboxgl.Map({
      container: mapContainer?.current as HTMLElement,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 10,
      minZoom: 2,
      maxZoom: 15,
    })

    // Add navigation controls
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    addMarkersForSurfSpots(surfSpots, mapRef.current)

    // Map loading event
    mapRef.current.on('load', () => setLoading(false))

    return () => mapRef.current?.remove()
  }, [userLocation])
}
