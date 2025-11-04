import { useRef, useState, memo, useEffect, useCallback } from 'react'
import classNames from 'classnames'
import mapboxgl from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css'

import SkeletonLoader from '../SkeletonLoader'
import { SurfSpot } from '~/types/surfSpots'
import {
  initializeMap,
  addMarkerForCoordinate,
  addSourceData,
  addLayers,
  removeSource,
  fetchSurfSpotsByBounds,
  updateMapSourceData,
} from '~/services/mapService'
import { useSurfSpotsContext, useUserContext } from '~/contexts'
import { useMapDrawer } from '~/hooks/useMapDrawer'
import { debounce } from '~/utils'
import { FetcherSubmitParams } from '../SurfSpotActions'

interface IProps {
  surfSpots?: SurfSpot[] // For static maps (with disableInteractions) OR pre-loaded spots for dynamic maps
  disableInteractions?: boolean
  onFetcherSubmit?: (params: FetcherSubmitParams) => void
}

export const SurfMap = memo((props: IProps) => {
  const { surfSpots, disableInteractions, onFetcherSubmit } = props
  const [loading, setLoading] = useState(true)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const { user } = useUserContext()
  const {
    filters,
    surfSpots: contextSurfSpots,
    setSurfSpots,
    mergeSurfSpots,
  } = useSurfSpotsContext()

  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  // Track pre-loaded spots for memoized callbacks (avoid stale closures)
  const preloadedSpotsRef = useRef<SurfSpot[] | undefined>(
    !disableInteractions && surfSpots?.length ? surfSpots : undefined,
  )

  useEffect(() => {
    if (disableInteractions) return
    preloadedSpotsRef.current = surfSpots?.length ? surfSpots : undefined

    if (mapRef.current && surfSpots?.length) {
      updateMapSourceData(mapRef.current, surfSpots)
    }
  }, [surfSpots, disableInteractions])

  const filtersRef = useRef(filters)
  const contextSurfSpotsRef = useRef(contextSurfSpots)

  useEffect(() => {
    contextSurfSpotsRef.current = contextSurfSpots
  }, [contextSurfSpots])

  const debouncedFetchSurfSpots = useCallback(
    debounce(async (map: mapboxgl.Map) => {
      if (preloadedSpotsRef.current) return

      try {
        const newSurfSpots = await fetchSurfSpotsByBounds(
          map,
          user?.id,
          filtersRef.current,
        )

        mergeSurfSpots(newSurfSpots)

        if (map && !map._removed && !preloadedSpotsRef.current) {
          const currentSpots = contextSurfSpotsRef.current || []
          const mergedSpots = [
            ...currentSpots,
            ...newSurfSpots.filter(
              (spot) =>
                !currentSpots.some((existing) => existing.id === spot.id),
            ),
          ]
          updateMapSourceData(map, mergedSpots)
        }
      } catch (error) {
        console.error('Error fetching surf spots:', error)
      }
    }, 500),
    [user?.id, mergeSurfSpots],
  )

  useEffect(() => {
    const hasPreloaded = !disableInteractions && surfSpots?.length
    if (hasPreloaded) return

    const prevFilters = filtersRef.current
    const filtersChanged =
      JSON.stringify(prevFilters) !== JSON.stringify(filters)

    filtersRef.current = filters

    if (filtersChanged && mapRef.current) {
      setSurfSpots([])
      fetchSurfSpotsByBounds(mapRef.current, user?.id, filters)
        .then((newSurfSpots) => {
          setSurfSpots(newSurfSpots)
          if (mapRef.current && !mapRef.current._removed) {
            updateMapSourceData(mapRef.current, newSurfSpots)
          }
        })
        .catch((error) => {
          console.error('Error fetching surf spots on filter change:', error)
        })
    }
  }, [filters, user?.id, setSurfSpots, disableInteractions, surfSpots])

  const { handleMarkerClick } = useMapDrawer(onFetcherSubmit)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return
    }

    let mapInstance: mapboxgl.Map

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
      mapInstance = initializeMap(mapContainerRef.current, true)
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right')

      mapInstance.on('load', () => {
        setLoading(false)

        const hasPreloaded = !disableInteractions && surfSpots?.length
        const spotsToDisplay = hasPreloaded ? surfSpots : contextSurfSpots || []

        addSourceData(mapInstance, spotsToDisplay)
        addLayers(mapInstance, handleMarkerClick)

        if (!hasPreloaded && !contextSurfSpots.length) {
          debouncedFetchSurfSpots(mapInstance)
        }
      })

      const hasPreloaded = !disableInteractions && surfSpots?.length
      if (!hasPreloaded) {
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
  }, [disableInteractions, surfSpots])

  useEffect(() => {
    if (disableInteractions || !mapRef.current) return

    const hasPreloaded = surfSpots?.length
    if (hasPreloaded) {
      updateMapSourceData(mapRef.current, surfSpots)
      return
    }

    if (contextSurfSpots.length) {
      updateMapSourceData(mapRef.current, contextSurfSpots)
    }
  }, [contextSurfSpots, disableInteractions, surfSpots])

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
