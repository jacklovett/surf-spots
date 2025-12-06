import { useRef, useState, memo, useEffect, useCallback } from 'react'
import classNames from 'classnames'
import mapboxgl from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css'

import SkeletonLoader from '../SkeletonLoader'
import { SurfSpot, Coordinates } from '~/types/surfSpots'
import {
  initializeMap,
  addMarkerForCoordinate,
  addSourceData,
  addLayers,
  removeSource,
  fetchSurfSpotsByBounds,
  updateMapSourceData,
  defaultMapCenter,
} from '~/services/mapService'
import { useSurfSpotsContext, useUserContext } from '~/contexts'
import { useMapDrawer } from '~/hooks/useMapDrawer'
import { debounce } from '~/utils'
import { FetcherSubmitParams } from '../SurfSpotActions'

interface IProps {
  surfSpots?: SurfSpot[]
  disableInteractions?: boolean
  onFetcherSubmit?: (params: FetcherSubmitParams) => void
}

export const SurfMap = memo((props: IProps) => {
  const { surfSpots, disableInteractions, onFetcherSubmit } = props
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const [locationFetched, setLocationFetched] = useState(false)

  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  // surfSpots prop provided = use only those spots (even if empty array)
  // surfSpots prop undefined = fetch spots dynamically based on map bounds
  const isPreloadedMode = !disableInteractions && surfSpots !== undefined

  const { user } = useUserContext()
  const {
    filters,
    surfSpots: contextSurfSpots,
    setSurfSpots,
    mergeSurfSpots,
  } = useSurfSpotsContext()

  // Refs to avoid stale closures in callbacks
  const filtersRef = useRef(filters)
  const contextSurfSpotsRef = useRef(contextSurfSpots)

  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  useEffect(() => {
    contextSurfSpotsRef.current = contextSurfSpots
  }, [contextSurfSpots])

  const { handleMarkerClick } = useMapDrawer(onFetcherSubmit)

  // Debounced fetch for dynamic mode
  const debouncedFetchSurfSpots = useCallback(
    debounce(async (map: mapboxgl.Map) => {
      try {
        const newSurfSpots = await fetchSurfSpotsByBounds(
          map,
          user?.id,
          filtersRef.current,
        )
        mergeSurfSpots(newSurfSpots)
      } catch (error) {
        console.error('Error fetching surf spots:', error)
      }
    }, 500),
    [user?.id, mergeSurfSpots],
  )

  // Handle filter changes (dynamic mode only) - replace spots with filtered results
  useEffect(() => {
    if (isPreloadedMode || disableInteractions || !mapRef.current) return

    fetchSurfSpotsByBounds(mapRef.current, user?.id, filters)
      .then((newSurfSpots) => {
        setSurfSpots(newSurfSpots)
        if (mapRef.current && !mapRef.current._removed) {
          updateMapSourceData(mapRef.current, newSurfSpots)
        }
      })
      .catch((error) =>
        console.error('Error fetching surf spots on filter change:', error),
      )
  }, [filters, user?.id, setSurfSpots, disableInteractions, isPreloadedMode])

  // Fetch user's location on mount (interactive maps only)
  useEffect(() => {
    if (disableInteractions || locationFetched) return

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
          })
          setLocationFetched(true)
        },
        () => {
          setUserLocation(defaultMapCenter)
          setLocationFetched(true)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      )
    } else {
      setUserLocation(defaultMapCenter)
      setLocationFetched(true)
    }
  }, [disableInteractions, locationFetched])

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return
    if (!disableInteractions && !locationFetched) return

    let mapInstance: mapboxgl.Map

    // Static map mode (single marker, no interactions)
    if (disableInteractions && surfSpots && surfSpots.length > 0) {
      const { longitude, latitude } = surfSpots[0]
      mapInstance = initializeMap(mapContainerRef.current, false, {
        longitude,
        latitude,
      })
      mapInstance.on('load', () => {
        setLoading(false)
        addMarkerForCoordinate({ longitude, latitude }, mapInstance)
      })
    } else {
      // Interactive map mode
      const initialCoords = userLocation || defaultMapCenter
      mapInstance = initializeMap(mapContainerRef.current, true, initialCoords)
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right')

      mapInstance.on('load', () => {
        setLoading(false)
        const initialSpots = isPreloadedMode
          ? surfSpots || []
          : contextSurfSpots || []
        addSourceData(mapInstance, initialSpots)
        addLayers(mapInstance, handleMarkerClick)

        // Only fetch on load if dynamic mode with no existing spots
        if (!isPreloadedMode && !contextSurfSpots.length) {
          debouncedFetchSurfSpots(mapInstance)
        }
      })

      // Pan/zoom handlers for dynamic mode only
      if (!isPreloadedMode) {
        const handleMapUpdate = () => {
          if (mapInstance && !mapInstance._removed) {
            debouncedFetchSurfSpots(mapInstance)
          }
        }
        mapInstance.on('moveend', handleMapUpdate)
        mapInstance.on('zoomend', handleMapUpdate)
      }
    }

    mapRef.current = mapInstance

    return () => {
      if (mapInstance) {
        removeSource(mapInstance)
        mapInstance.remove()
        mapRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disableInteractions, locationFetched, userLocation])

  // Update map data when spots change
  useEffect(() => {
    if (disableInteractions || !mapRef.current) return

    const spotsToDisplay = isPreloadedMode ? surfSpots || [] : contextSurfSpots
    if (spotsToDisplay.length || isPreloadedMode) {
      updateMapSourceData(mapRef.current, spotsToDisplay)
    }
  }, [surfSpots, contextSurfSpots, disableInteractions, isPreloadedMode])

  return (
    <div className={classNames({ 'map-container': true, border: !loading })}>
      <div
        ref={mapContainerRef}
        className={classNames({
          map: true,
          'map-visible': !loading,
          'static-map': disableInteractions,
        })}
      />
      {loading && <SkeletonLoader />}
    </div>
  )
})

SurfMap.displayName = 'SurfMap'
