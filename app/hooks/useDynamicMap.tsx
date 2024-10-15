import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useNavigate } from '@remix-run/react'
import mapboxgl from 'mapbox-gl'
import {
  addMarkersForSurfSpots,
  defaultMapCenter,
  fetchSurfSpotsByBounds,
  MAP_ACCESS_TOKEN,
} from '~/services/mapService'
import { Coordinates, SurfSpot } from '~/types/surfSpots'
import { debounce } from '~/utils'

export const useDynamicMap = (
  mapContainer: MutableRefObject<HTMLDivElement | null>,
  setLoading: (value: boolean) => void,
) => {
  const navigate = useNavigate()
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [userLocation, setUserLocation] =
    useState<Coordinates>(defaultMapCenter)
  const [surfSpots, setSurfSpots] = useState<SurfSpot[]>([])
  const loadedBoundsRef = useRef<mapboxgl.LngLatBounds[]>([])

  const isBoundsAlreadyLoaded = (newBounds: mapboxgl.LngLatBounds) =>
    loadedBoundsRef.current.some(
      (loadedBounds) =>
        loadedBounds.contains(newBounds.getNorthEast()) &&
        loadedBounds.contains(newBounds.getSouthWest()),
    )

  // UseCallback for the debounced function to prevent re-creation on every render
  const debouncedFetchSurfSpots = useCallback(
    debounce(async (currentMap: mapboxgl.Map) => {
      const newBounds = currentMap.getBounds()

      if (!newBounds) {
        console.log('New map bounds not received.')
        return
      }

      if (isBoundsAlreadyLoaded(newBounds)) {
        console.log('Bounds already loaded, no need to fetch.')
        return
      }

      try {
        const newSurfSpots: SurfSpot[] = await fetchSurfSpotsByBounds(
          currentMap,
        )
        setSurfSpots((prevSpots) => {
          const surfSpotIds = prevSpots.map((spot) => spot.id)
          const uniqueSpots = newSurfSpots.filter(
            (spot) => !surfSpotIds.includes(spot.id),
          )
          return [...prevSpots, ...uniqueSpots]
        })
      } catch (error) {
        console.error('Error fetching surf spots:', error)
      }

      loadedBoundsRef.current.push(newBounds)
    }, 500),
    [],
  )

  // Only fetch user location once for initial load
  useEffect(
    () =>
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation(position.coords),
        (error) => console.error('Error getting user location:', error),
      ),
    [],
  )

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) {
      return
    }

    mapboxgl.accessToken = MAP_ACCESS_TOKEN

    const currentMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 10,
      minZoom: 2,
      maxZoom: 15,
    })

    mapRef.current = currentMap

    // Add zoom/move controls
    currentMap.addControl(new mapboxgl.NavigationControl(), 'top-right')

    currentMap.on('load', () => {
      setLoading(false)
      debouncedFetchSurfSpots(currentMap) // Fetch surf spots once the map is loaded
    })

    currentMap.on('moveend', () => debouncedFetchSurfSpots(currentMap))
    currentMap.on('zoomend', () => debouncedFetchSurfSpots(currentMap))

    return () => {
      if (mapRef.current) {
        mapRef.current.off('moveend', () => debouncedFetchSurfSpots(currentMap))
        mapRef.current.off('zoomend', () => debouncedFetchSurfSpots(currentMap))
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [debouncedFetchSurfSpots, mapContainer])

  // Add markers only when surf spots change
  useEffect(() => {
    if (mapRef.current && surfSpots.length > 0) {
      addMarkersForSurfSpots(surfSpots, mapRef.current, (path) =>
        navigate(path),
      )
    }
  }, [surfSpots])

  return mapRef
}
