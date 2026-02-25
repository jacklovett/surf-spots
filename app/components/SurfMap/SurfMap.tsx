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
  fitMapToSurfSpots,
  WITHIN_BOUNDS_TIMEOUT_MS,
} from '~/services/mapService'
import { getDisplayMessage } from '~/services/networkService'
import { useSurfSpotsContext, useUserContext } from '~/contexts'
import { useMapDrawer, useResizeObserver } from '~/hooks'
import { debounce } from '~/utils/commonUtils'
import { FetcherSubmitParams } from '~/types/api'
import { ERROR_LOAD_MAP_SPOTS } from '~/utils/errorUtils'
import { Button, ContentStatus } from '~/components'

interface IProps {
  surfSpots?: SurfSpot[]
  disableInteractions?: boolean
  onFetcherSubmit?: (params: FetcherSubmitParams) => void
}

export const SurfMap = memo((props: IProps) => {
  const { surfSpots, disableInteractions, onFetcherSubmit } = props
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
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

  // Debounced fetch for dynamic mode; setError allows showing timeout/network errors in map area
  const debouncedFetchSurfSpots = useCallback(
    debounce(
      async (
        map: mapboxgl.Map,
        setError?: (msg: string | null) => void,
      ) => {
        try {
          setError?.(null)
          const newSurfSpots = await fetchSurfSpotsByBounds(
            map,
            user?.id,
            filtersRef.current,
            { timeoutMs: WITHIN_BOUNDS_TIMEOUT_MS },
          )
          mergeSurfSpots(newSurfSpots)
        } catch (error) {
          console.error('Error fetching surf spots:', error)
          setError?.(getDisplayMessage(error, ERROR_LOAD_MAP_SPOTS))
        }
      },
      500,
    ),
    [user?.id, mergeSurfSpots],
  )

  // Handle filter changes (dynamic mode only) - replace spots with filtered results
  useEffect(() => {
    if (isPreloadedMode || disableInteractions || !mapRef.current) return

    fetchSurfSpotsByBounds(mapRef.current, user?.id, filters, {
      timeoutMs: WITHIN_BOUNDS_TIMEOUT_MS,
    })
      .then((newSurfSpots) => {
        setLoadError(null)
        setSurfSpots(newSurfSpots)
        if (mapRef.current && !mapRef.current._removed) {
          updateMapSourceData(mapRef.current, newSurfSpots)
        }
      })
      .catch((error) => {
        console.error('Error fetching surf spots on filter change:', error)
        setLoadError(getDisplayMessage(error, ERROR_LOAD_MAP_SPOTS))
      })
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
      // For preloaded mode with spots, use first spot or geographic center as initial position
      // Then fit bounds after load to show all spots
      // Otherwise, use user location or default center
      let initialCoords: Coordinates
      if (isPreloadedMode && surfSpots && surfSpots.length > 0) {
        // Use first spot as initial center, will be adjusted by fitBounds
        initialCoords = {
          longitude: surfSpots[0].longitude,
          latitude: surfSpots[0].latitude,
        }
      } else {
        initialCoords = userLocation || defaultMapCenter
      }
      mapInstance = initializeMap(mapContainerRef.current, true, initialCoords)
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right')

      mapInstance.on('load', () => {
        setLoading(false)
        const initialSpots = isPreloadedMode
          ? surfSpots || []
          : contextSurfSpots || []
        addSourceData(mapInstance, initialSpots)
        addLayers(mapInstance, handleMarkerClick)

        // Fit map to show all spots if in preloaded mode with spots
        if (isPreloadedMode && initialSpots.length > 0) {
          // Small delay to ensure layers are rendered
          setTimeout(() => fitMapToSurfSpots(mapInstance, initialSpots), 100)
        }

        // Only fetch on load if dynamic mode with no existing spots
        if (!isPreloadedMode && !contextSurfSpots.length) {
          debouncedFetchSurfSpots(mapInstance, setLoadError)
        }
      })

      // Pan/zoom handlers for dynamic mode only
      if (!isPreloadedMode) {
        const handleMapUpdate = () => {
          if (mapInstance && !mapInstance._removed) {
            debouncedFetchSurfSpots(mapInstance, setLoadError)
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
      
      // Fit bounds to show all spots when in preloaded mode and spots change
      if (isPreloadedMode && spotsToDisplay.length > 0) {
        // Small delay to ensure source data is updated
        setTimeout(() => {
          if (mapRef.current && !mapRef.current._removed) {
            fitMapToSurfSpots(mapRef.current, spotsToDisplay)
          }
        }, 100)
      }
    }
  }, [surfSpots, contextSurfSpots, disableInteractions, isPreloadedMode])

  // Resize map when container size changes (e.g., switching from list to map view)
  const handleMapResize = useCallback(() => {
    if (mapRef.current && !mapRef.current._removed) {
      mapRef.current.resize()
    }
  }, [])

  useResizeObserver(mapContainerRef, handleMapResize, {
    delay: 0, // Small delay to ensure flex layout has calculated dimensions
    enabled: !disableInteractions && !!mapRef.current,
    triggerOnMount: true, // Trigger resize when observer is set up (e.g., when map becomes visible)
    initialDelay: 100, // Delay to ensure flex layout has calculated final dimensions
  })

  const handleRetryMapLoad = useCallback(() => {
    setLoadError(null)
    if (mapRef.current && !mapRef.current._removed) {
      debouncedFetchSurfSpots(mapRef.current, setLoadError)
    }
  }, [debouncedFetchSurfSpots])

  if (loadError && !disableInteractions) {
    return (
      <div className="map-container border">
        <ContentStatus isError>
          <p>{loadError}</p>
          <Button className="mt" onClick={handleRetryMapLoad}>
            Try again
          </Button>
        </ContentStatus>
      </div>
    )
  }

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
