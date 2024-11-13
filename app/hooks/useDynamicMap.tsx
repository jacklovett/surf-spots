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
  addLayers,
  addSourceData,
  defaultMapCenter,
  fetchSurfSpotsByBounds,
  getSourceData,
  initializeMap,
  removeSource,
} from '~/services/mapService'
import { Coordinates, SurfSpot } from '~/types/surfSpots'
import { debounce } from '~/utils'
import { useUser } from '~/contexts/UserContext'

export const useDynamicMap = (
  mapContainer: MutableRefObject<HTMLDivElement | null>,
  setLoading: (value: boolean) => void,
) => {
  const navigate = useNavigate()
  const { user } = useUser()
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [userLocation, setUserLocation] =
    useState<Coordinates>(defaultMapCenter)
  const [surfSpots, setSurfSpots] = useState<SurfSpot[]>([])
  const loadedBoundsRef = useRef<mapboxgl.LngLatBounds[]>([])

  /**
   * Helper function to check if bounds are already loaded
   */
  const isBoundsAlreadyLoaded = useCallback(
    (newBounds: mapboxgl.LngLatBounds) =>
      loadedBoundsRef.current.some(
        (loadedBounds) =>
          loadedBounds.contains(newBounds.getNorthEast()) &&
          loadedBounds.contains(newBounds.getSouthWest()),
      ),
    [],
  )

  /**
   * Debounced function to fetch surf spots based on map bounds
   */
  const debouncedFetchSurfSpots = useCallback(
    debounce(async (currentMap: mapboxgl.Map) => {
      const newBounds = currentMap.getBounds()

      if (!newBounds || isBoundsAlreadyLoaded(newBounds)) return

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
        loadedBoundsRef.current.push(newBounds)
      } catch (error) {
        console.error('Error fetching surf spots:', error)
      }
    }, 500),
    [],
  )

  // Fetch user's geolocation once for initial map load
  useEffect(
    () =>
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation(position.coords),
        (error) => console.error('Error getting user location:', error),
      ),
    [],
  )

  // Initialize the map and set up event listeners for move and zoom actions
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return

    const currentMap = initializeMap(mapContainer.current, true, userLocation)
    mapRef.current = currentMap

    currentMap.addControl(new mapboxgl.NavigationControl(), 'top-right')

    currentMap.on('load', () => {
      setLoading(false)
      addSourceData(currentMap, surfSpots)
      addLayers(currentMap, user, navigate)
      debouncedFetchSurfSpots(currentMap)
    })

    // Add event listeners for map movements
    const handleMapUpdate = () => debouncedFetchSurfSpots(currentMap)
    currentMap.on('moveend', handleMapUpdate)
    currentMap.on('zoomend', handleMapUpdate)

    return () => {
      removeSource(currentMap)
      currentMap.off('moveend', handleMapUpdate)
      currentMap.off('zoomend', handleMapUpdate)
      currentMap.remove()
      mapRef.current = null
    }
  }, [debouncedFetchSurfSpots, mapContainer])

  // Update map source data when surfSpots changes
  useEffect(() => {
    if (mapRef.current && surfSpots.length > 0) {
      const source = mapRef.current.getSource(
        'surfSpots',
      ) as mapboxgl.GeoJSONSource
      if (source) {
        source.setData(getSourceData(surfSpots))
      }
    }
  }, [surfSpots])

  return mapRef
}
