import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
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
import { FetcherSubmitParams } from '~/components/SurfSpotActions'
import { useSurfSpotsContext, useUserContext } from '~/contexts'
import { useMapDrawer } from './useMapDrawer'

/**
 * Custom hook for managing a dynamic Mapbox GL map with surf spot markers.
 * Handles map initialization, user location, filtering, and data fetching.
 * @param mapContainer - Ref to the HTML div element for the map container.
 * @param setLoading - Function to set the loading state.
 */
export const useDynamicMap = (
  mapContainer: MutableRefObject<HTMLDivElement | null>,
  setLoading: (value: boolean) => void,
  onFetcherSubmit?: (params: FetcherSubmitParams) => void,
) => {
  const { user } = useUserContext()
  const userId = user?.id

  const { filters } = useSurfSpotsContext()

  const mapRef = useRef<mapboxgl.Map | null>(null)
  const loadedBoundsRef = useRef<mapboxgl.LngLatBounds[]>([])

  const [userLocation, setUserLocation] =
    useState<Coordinates>(defaultMapCenter)

  const [surfSpots, setSurfSpots] = useState<SurfSpot[]>([])

  // Callback to update a specific surf spot in the state
  const onSurfSpotUpdate = useCallback((updatedSurfSpot: SurfSpot) => {
    setSurfSpots((prevSpots) => {
      return prevSpots.map((spot) =>
        spot.id === updatedSurfSpot.id ? updatedSurfSpot : spot,
      )
    })
  }, [])

  // Use the drawer hook for marker clicks
  const { handleMarkerClick } = useMapDrawer(onFetcherSubmit, onSurfSpotUpdate)

  /**
   * Checks if the given map bounds have already been loaded
   * @param newBounds - Bounds to check
   * @returns true if bounds were already loaded, false otherwise
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

  const filtersRef = useRef(filters)
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  /**
   * Debounced function to fetch surf spots within the current map bounds
   * @param currentMap - Mapbox map instance
   * @param forceRefetch - Whether to force a refetch of surf spots
   */
  const debouncedFetchSurfSpots = useCallback(
    debounce(async (currentMap: mapboxgl.Map, forceRefetch = false) => {
      const newBounds = currentMap.getBounds()
      if (!newBounds) return

      // Use the ref to get the latest filters
      const currentFilters = filtersRef.current

      if (!forceRefetch && isBoundsAlreadyLoaded(newBounds)) return

      try {
        const newSurfSpots = await fetchSurfSpotsByBounds(
          currentMap,
          userId,
          currentFilters, // Use the ref value
        )

        if (forceRefetch) {
          setSurfSpots(newSurfSpots)
        } else {
          setSurfSpots((prevSpots) => {
            const surfSpotMap = new Map(
              prevSpots.map((spot) => [spot.id, spot]),
            )
            newSurfSpots.forEach((spot) => surfSpotMap.set(spot.id, spot))
            return Array.from(surfSpotMap.values())
          })
        }
        loadedBoundsRef.current.push(newBounds)
      } catch (error) {
        console.error('Error fetching surf spots:', error)
      }
    }, 500),
    [userId],
  )

  // Refetch surf spots when filters change
  useEffect(() => {
    if (!mapRef.current) {
      return
    }
    debouncedFetchSurfSpots(mapRef.current, true)
  }, [filters, userId])

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
    // Skip if map is already initialized or container isn't available
    if (mapRef.current || !mapContainer.current) {
      return
    }

    // Initialize the map with user's location
    const currentMap = initializeMap(mapContainer.current, true, userLocation)
    mapRef.current = currentMap
    // Add navigation controls
    currentMap.addControl(new mapboxgl.NavigationControl(), 'top-right')

    currentMap.on('load', () => {
      setLoading(false)
      addSourceData(currentMap, surfSpots)
      addLayers(currentMap, handleMarkerClick)
      debouncedFetchSurfSpots(currentMap)
    })

    // Add event listeners for map movements
    // Fetch new spots when map moves or zooms
    const handleMapUpdate = () => debouncedFetchSurfSpots(currentMap)
    currentMap.on('moveend', handleMapUpdate)
    currentMap.on('zoomend', handleMapUpdate)

    // Cleanup: remove event listeners and map when unmounting
    return () => {
      removeSource(currentMap)
      currentMap.off('moveend', handleMapUpdate)
      currentMap.off('zoomend', handleMapUpdate)
      currentMap.remove()
      mapRef.current = null
    }
  }, [mapContainer])

  // Update map source data when surfSpots changes
  useEffect(() => {
    if (mapRef.current) {
      const source = mapRef.current.getSource(
        'surfSpots',
      ) as mapboxgl.GeoJSONSource

      if (source) {
        // Update the source with current surf spots data
        // This automatically updates the map visualization
        source.setData(getSourceData(surfSpots))
      } else {
        console.warn('Surf spots source not found on map')
      }
    }
  }, [surfSpots])

  return mapRef
}
