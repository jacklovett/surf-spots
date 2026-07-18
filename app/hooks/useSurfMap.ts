import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FetcherWithComponents } from 'react-router'

import { useSurfSpotsContext, useUserContext } from '~/contexts'
import {
  addLayers,
  addMarkerForCoordinate,
  addSourceData,
  defaultMapCenter,
  fetchSurfSpotsByBounds,
  fitMapToSurfSpots,
  removeSource,
  updateMapSourceData,
  WITHIN_BOUNDS_TIMEOUT_MS,
} from '~/services/mapService'
import { getDisplayMessage } from '~/services/networkService'
import { ActionData, SurfSpotQuickActionSubmitHandler } from '~/types/api'
import { Coordinates, SurfSpot } from '~/types/surfSpots'
import { debounce } from '~/utils/commonUtils'
import { ERROR_LOAD_MAP, ERROR_LOAD_MAP_DATA } from '~/utils/errorUtils'

import { useMapInstance } from './useMapInstance'
import { useSurfSpotDrawer } from './useSurfSpotDrawer'

export interface UseSurfMapParams {
  surfSpots?: SurfSpot[]
  disableInteractions?: boolean
  onFetcherSubmit?: SurfSpotQuickActionSubmitHandler
  surfActionFetcher?: FetcherWithComponents<ActionData>
}

export const useSurfMap = (params: UseSurfMapParams) => {
  const {
    surfSpots,
    disableInteractions,
    onFetcherSubmit,
    surfActionFetcher,
  } = params

  const [mapInitError, setMapInitError] = useState<string | null>(null)
  const [spotsLoadError, setSpotsLoadError] = useState<string | null>(null)
  const [spotsRetryLoading, setSpotsRetryLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const [locationFetched, setLocationFetched] = useState(false)

  // surfSpots prop provided = use only those spots (even if empty array)
  // surfSpots prop undefined = fetch spots dynamically based on map bounds
  const isPreloadedMode = !disableInteractions && surfSpots !== undefined
  const isStaticMode = Boolean(disableInteractions)

  const { user } = useUserContext()
  const {
    filters,
    surfSpots: contextSurfSpots,
    setSurfSpots,
    mergeSurfSpots,
  } = useSurfSpotsContext()

  const filtersRef = useRef(filters)
  const contextSurfSpotsRef = useRef(contextSurfSpots)
  const isPreloadedModeRef = useRef(isPreloadedMode)
  const isStaticModeRef = useRef(isStaticMode)
  const surfSpotsRef = useRef(surfSpots)
  const handleMapBoundsUpdateRef = useRef<(() => void) | null>(null)

  filtersRef.current = filters
  contextSurfSpotsRef.current = contextSurfSpots
  isPreloadedModeRef.current = isPreloadedMode
  isStaticModeRef.current = isStaticMode
  surfSpotsRef.current = surfSpots

  const { openSurfSpotDrawer } = useSurfSpotDrawer(
    onFetcherSubmit,
    surfActionFetcher,
  )
  const openSurfSpotDrawerRef = useRef(openSurfSpotDrawer)
  openSurfSpotDrawerRef.current = openSurfSpotDrawer

  const debouncedFetchSurfSpots = useCallback(
    debounce(async (map: mapboxgl.Map) => {
      try {
        const newSurfSpots = await fetchSurfSpotsByBounds(
          map,
          user?.id,
          filtersRef.current,
          { timeoutMs: WITHIN_BOUNDS_TIMEOUT_MS },
        )
        mergeSurfSpots(newSurfSpots)
        setSpotsLoadError(null)
      } catch (error) {
        console.error('Error fetching surf spots:', error)
        setSpotsLoadError(getDisplayMessage(error, ERROR_LOAD_MAP_DATA))
      }
    }, 500),
    [user?.id, mergeSurfSpots],
  )
  const debouncedFetchSurfSpotsRef = useRef(debouncedFetchSurfSpots)
  debouncedFetchSurfSpotsRef.current = debouncedFetchSurfSpots

  useEffect(() => {
    if (disableInteractions || locationFetched) {
      return
    }

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

  const initialCenter = useMemo((): Coordinates => {
    if (
      (isStaticMode || isPreloadedMode) &&
      surfSpots != null &&
      surfSpots.length > 0
    ) {
      return {
        longitude: surfSpots[0].longitude,
        latitude: surfSpots[0].latitude,
      }
    }

    return userLocation ?? defaultMapCenter
  }, [isPreloadedMode, isStaticMode, surfSpots, userLocation])

  const handleMapLoad = useCallback((map: mapboxgl.Map) => {
    if (isStaticModeRef.current) {
      const staticSpots = surfSpotsRef.current
      if (staticSpots != null && staticSpots.length > 0) {
        const { longitude, latitude } = staticSpots[0]
        addMarkerForCoordinate({ longitude, latitude }, map)
      }
      return
    }

    const initialSpots = isPreloadedModeRef.current
      ? surfSpotsRef.current || []
      : contextSurfSpotsRef.current || []

    addSourceData(map, initialSpots)
    addLayers(map, (event) => openSurfSpotDrawerRef.current(event))

    if (isPreloadedModeRef.current && initialSpots.length > 0) {
      setTimeout(() => fitMapToSurfSpots(map, initialSpots), 100)
    }

    if (!isPreloadedModeRef.current && !contextSurfSpotsRef.current.length) {
      debouncedFetchSurfSpotsRef.current(map)
    }

    if (!isPreloadedModeRef.current) {
      const handleMapBoundsUpdate = () => {
        if (!map._removed) {
          debouncedFetchSurfSpotsRef.current(map)
        }
      }
      handleMapBoundsUpdateRef.current = handleMapBoundsUpdate
      map.on('moveend', handleMapBoundsUpdate)
      map.on('zoomend', handleMapBoundsUpdate)
    }
  }, [])

  const handleMapCleanup = useCallback((map: mapboxgl.Map) => {
    const handleMapBoundsUpdate = handleMapBoundsUpdateRef.current
    if (handleMapBoundsUpdate != null) {
      map.off('moveend', handleMapBoundsUpdate)
      map.off('zoomend', handleMapBoundsUpdate)
      handleMapBoundsUpdateRef.current = null
    }
    removeSource(map)
  }, [])

  const handleMapError = useCallback(() => {
    setMapInitError(ERROR_LOAD_MAP)
  }, [])

  const mapEnabled = isStaticMode || locationFetched

  const { mapContainerRef, mapRef, loading } = useMapInstance({
    enabled: mapEnabled,
    interactive: !isStaticMode,
    initialCenter,
    showNavigationControl: !isStaticMode,
    onLoad: handleMapLoad,
    onCleanup: handleMapCleanup,
    onError: handleMapError,
  })

  useEffect(() => {
    if (isPreloadedMode || disableInteractions || !mapRef.current) {
      return
    }

    fetchSurfSpotsByBounds(mapRef.current, user?.id, filters, {
      timeoutMs: WITHIN_BOUNDS_TIMEOUT_MS,
    })
      .then((newSurfSpots) => {
        setSpotsLoadError(null)
        setSurfSpots(newSurfSpots)
        if (mapRef.current && !mapRef.current._removed) {
          updateMapSourceData(mapRef.current, newSurfSpots)
        }
      })
      .catch((error) => {
        console.error('Error fetching surf spots on filter change:', error)
        setSpotsLoadError(getDisplayMessage(error, ERROR_LOAD_MAP_DATA))
      })
  }, [
    filters,
    user?.id,
    setSurfSpots,
    disableInteractions,
    isPreloadedMode,
    mapRef,
  ])

  useEffect(() => {
    if (disableInteractions || !mapRef.current) {
      return
    }

    const spotsToDisplay = isPreloadedMode ? surfSpots || [] : contextSurfSpots
    if (spotsToDisplay.length || isPreloadedMode) {
      updateMapSourceData(mapRef.current, spotsToDisplay)

      if (isPreloadedMode && spotsToDisplay.length > 0) {
        setTimeout(() => {
          if (mapRef.current && !mapRef.current._removed) {
            fitMapToSurfSpots(mapRef.current, spotsToDisplay)
          }
        }, 100)
      }
    }
  }, [
    surfSpots,
    contextSurfSpots,
    disableInteractions,
    isPreloadedMode,
    mapRef,
  ])

  const handleRetrySpotsLoad = useCallback(async () => {
    const map = mapRef.current
    if (map == null || map._removed) {
      return
    }

    setSpotsRetryLoading(true)
    try {
      const newSurfSpots = await fetchSurfSpotsByBounds(
        map,
        user?.id,
        filtersRef.current,
        { timeoutMs: WITHIN_BOUNDS_TIMEOUT_MS },
      )
      mergeSurfSpots(newSurfSpots)
      setSpotsLoadError(null)
    } catch (error) {
      console.error('Error fetching surf spots:', error)
      setSpotsLoadError(getDisplayMessage(error, ERROR_LOAD_MAP_DATA))
    } finally {
      setSpotsRetryLoading(false)
    }
  }, [mapRef, mergeSurfSpots, user?.id])

  const handleRetryMapInit = useCallback(() => {
    setSpotsRetryLoading(true)
    window.location.reload()
  }, [])

  const mapReady = !loading && mapInitError == null
  const contentError =
    mapInitError ?? (!disableInteractions ? spotsLoadError : null)

  return {
    mapContainerRef,
    loading,
    mapReady,
    contentError,
    mapInitError,
    spotsRetryLoading,
    handleRetrySpotsLoad,
    handleRetryMapInit,
    disableInteractions: Boolean(disableInteractions),
  }
}
