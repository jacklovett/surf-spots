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
  getSourceData,
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
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const { user } = useUserContext()
  const {
    filters,
    surfSpots: contextSurfSpots,
    setSurfSpots,
    mergeSurfSpots,
  } = useSurfSpotsContext()

  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  // Update context when we fetch new surf spots
  const debouncedFetchSurfSpots = useCallback(
    debounce(async (map: mapboxgl.Map) => {
      try {
        const newSurfSpots = await fetchSurfSpotsByBounds(
          map,
          user?.id,
          filtersRef.current,
        )

        // Merge new surf spots with existing ones (don't replace)
        mergeSurfSpots(newSurfSpots)

        if (map && !map._removed) {
          const source = map.getSource('surfSpots') as mapboxgl.GeoJSONSource
          if (source) {
            // Get the updated surf spots from context after merge
            const updatedSurfSpots = [
              ...contextSurfSpots,
              ...newSurfSpots.filter(
                (newSpot) =>
                  !contextSurfSpots.some(
                    (existing) => existing.id === newSpot.id,
                  ),
              ),
            ]
            source.setData(getSourceData(updatedSurfSpots))
          }
        }
      } catch (error) {
        console.error('Error fetching surf spots:', error)
      }
    }, 500),
    [user?.id, mergeSurfSpots],
  )

  const filtersRef = useRef(filters)
  useEffect(() => {
    const prevFilters = filtersRef.current
    filtersRef.current = filters

    // If filters changed, clear existing surf spots and fetch with new filters
    if (JSON.stringify(prevFilters) !== JSON.stringify(filters)) {
      setSurfSpots([])
      if (mapRef.current) {
        // Fetch immediately with the new filters
        fetchSurfSpotsByBounds(mapRef.current, user?.id, filters).then(
          (newSurfSpots) => {
            setSurfSpots(newSurfSpots)
            if (mapRef.current && !mapRef.current._removed) {
              const source = mapRef.current.getSource(
                'surfSpots',
              ) as mapboxgl.GeoJSONSource
              if (source) {
                source.setData(getSourceData(newSurfSpots))
              }
            }
          },
        )
      }
    } else if (mapRef.current) {
      debouncedFetchSurfSpots(mapRef.current)
    }
  }, [filters])

  const { handleMarkerClick } = useMapDrawer(onFetcherSubmit)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return
    }

    let mapInstance: mapboxgl.Map

    if (disableInteractions && surfSpots && surfSpots.length > 0) {
      // Static map for single surf spot
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
      // Dynamic map for multiple surf spots
      mapInstance = initializeMap(mapContainerRef.current, true)

      // Add navigation controls
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right')

      mapInstance.on('load', () => {
        setLoading(false)
        addSourceData(mapInstance, contextSurfSpots || [])
        addLayers(mapInstance, handleMarkerClick)
        debouncedFetchSurfSpots(mapInstance)
      })

      // Add event listeners for map movements
      const handleMapUpdate = () => debouncedFetchSurfSpots(mapInstance)
      mapInstance.on('moveend', handleMapUpdate)
      mapInstance.on('zoomend', handleMapUpdate)
    }

    mapRef.current = mapInstance

    // Cleanup function
    return () => {
      if (mapInstance) {
        removeSource(mapInstance)
        mapInstance.remove()
        mapRef.current = null
      }
    }
  }, [disableInteractions])

  // Update map source data when context surf spots change
  useEffect(() => {
    if (mapRef.current && contextSurfSpots.length > 0) {
      const source = mapRef.current.getSource(
        'surfSpots',
      ) as mapboxgl.GeoJSONSource

      if (source) {
        source.setData(getSourceData(contextSurfSpots))
      }
    }
  }, [contextSurfSpots])

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
      {/* Skeleton Loader shown on top of the map while loading */}
      {loading && <SkeletonLoader />}
    </div>
  )
})

SurfMap.displayName = 'SurfMap'
