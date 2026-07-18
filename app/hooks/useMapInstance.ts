import { useCallback, useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

import { initializeMap, resizeMap } from '~/services/mapService'
import { Coordinates } from '~/types/surfSpots'

import { useResizeObserver } from './useResizeObserver'

export type UseMapInstanceOptions = {
  /** When false, skip creating the map (e.g. waiting for geolocation). */
  enabled?: boolean
  interactive: boolean
  /**
   * Center used only when the map is first created. Changing this later does
   * not recreate the map — move the camera or markers in the consumer.
   */
  initialCenter: Coordinates
  /** Defaults to true when interactive. */
  showNavigationControl?: boolean
  onLoad?: (map: mapboxgl.Map) => void
  onError?: (error: unknown) => void
  /** Runs before `map.remove()` on teardown. */
  onCleanup?: (map: mapboxgl.Map) => void
}

/**
 * Shared Mapbox lifecycle: initialize, optional nav control, load callback,
 * resize observer, and teardown. Feature-specific markers/layers stay in the
 * consumer (or in SurfMap for browse maps).
 */
export const useMapInstance = (options: UseMapInstanceOptions) => {
  const {
    enabled = true,
    interactive,
    initialCenter,
    showNavigationControl = interactive,
    onLoad,
    onError,
    onCleanup,
  } = options

  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [loading, setLoading] = useState(true)

  const initialCenterRef = useRef(initialCenter)
  const onLoadRef = useRef(onLoad)
  const onErrorRef = useRef(onError)
  const onCleanupRef = useRef(onCleanup)

  initialCenterRef.current = initialCenter
  onLoadRef.current = onLoad
  onErrorRef.current = onError
  onCleanupRef.current = onCleanup

  const handleMapContainerResize = useCallback(() => {
    resizeMap(mapRef.current)
  }, [])

  useResizeObserver(mapContainerRef, handleMapContainerResize, {
    triggerOnMount: true,
    initialDelay: 100,
  })

  useEffect(() => {
    if (!enabled || mapContainerRef.current == null || mapRef.current != null) {
      return
    }

    let mapInstance: mapboxgl.Map

    try {
      mapInstance = initializeMap(
        mapContainerRef.current,
        interactive,
        initialCenterRef.current,
      )
    } catch (error) {
      console.error('Map: failed to initialize', error)
      setLoading(false)
      onErrorRef.current?.(error)
      return
    }

    if (showNavigationControl) {
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right')
    }

    mapInstance.on('load', () => {
      setLoading(false)
      resizeMap(mapInstance)
      onLoadRef.current?.(mapInstance)
    })

    mapRef.current = mapInstance

    return () => {
      onCleanupRef.current?.(mapInstance)
      mapInstance.remove()
      mapRef.current = null
    }
  }, [enabled, interactive, showNavigationControl])

  return {
    mapContainerRef,
    mapRef,
    loading,
    setLoading,
  }
}
