import mapboxgl from 'mapbox-gl'
import { MutableRefObject, useEffect, useRef } from 'react'
import { addMarkerForCoordinate, MAP_ACCESS_TOKEN } from '~/services/mapService'
import { Coordinates } from '~/types/surfSpots'

export const useStaticMap = (
  coordinates: Coordinates,
  mapContainer: MutableRefObject<HTMLDivElement | null>,
  setLoading: (value: boolean) => void,
) => {
  const { longitude, latitude } = coordinates

  const mapRef = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    mapboxgl.accessToken = MAP_ACCESS_TOKEN

    // Initialize the map
    mapRef.current = new mapboxgl.Map({
      container: mapContainer?.current as HTMLElement,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [longitude, latitude],
      zoom: 12,
      interactive: false,
      scrollZoom: false,
      dragPan: false,
      doubleClickZoom: false,
      boxZoom: false,
      touchZoomRotate: false,
    })

    addMarkerForCoordinate(coordinates, mapRef.current)

    // Map loading event
    mapRef.current.on('load', () => setLoading(false))

    return () => mapRef.current?.remove()
  }, [])
}
