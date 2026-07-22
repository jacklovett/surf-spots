import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import classNames from 'classnames'
import mapboxgl from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css'

import SkeletonLoader from '../SkeletonLoader'
import ErrorBoundary from '../ErrorBoundary'
import { Coordinates } from '~/types/surfSpots'
import {
  addDomMarker,
  attachDomMarkerButton,
  createDomMarkerElement,
  fitMapToCoordinates,
  removeDomMarkers,
} from '~/services/mapService'
import { useMapInstance } from '~/hooks'
import { useSettingsContext } from '~/contexts'
import {
  AT_SPOT_RADIUS_KM,
  NearbySurfSpot,
} from '~/utils/nearbySurfSpots'
import { formatDistanceKm, type PreferredUnits } from '~/utils/unitUtils'
import { ERROR_BOUNDARY_MAP } from '~/utils/errorUtils'

interface EndSessionSpotMapProps {
  sessionCoordinates: Coordinates
  nearbySpots: NearbySurfSpot[]
  selectedSpotId: string
  onOpenSpotPreview: (spot: NearbySurfSpot) => void
}

const buildEndSessionSpotPinLabel = (
  spot: NearbySurfSpot,
  isSelected: boolean,
  preferredUnits: PreferredUnits,
): string => {
  const spotName = spot.name ?? 'surf spot'
  const distanceLabel = formatDistanceKm(spot.distanceKm, preferredUnits)
  return isSelected
    ? `${spotName} selected for this session (${distanceLabel})`
    : `Preview ${spotName} (${distanceLabel})`
}

const updateSpotPinSelection = (
  spotMarkers: Map<string, HTMLDivElement>,
  selectedSpotId: string,
  nearbySpots: NearbySurfSpot[],
  preferredUnits: PreferredUnits,
) => {
  spotMarkers.forEach((pinElement, spotId) => {
    const isSelected = spotId === selectedSpotId
    const spot = nearbySpots.find(
      (candidate) => candidate.id != null && String(candidate.id) === spotId,
    )
    const ariaLabel =
      spot != null
        ? buildEndSessionSpotPinLabel(spot, isSelected, preferredUnits)
        : isSelected
          ? 'Selected surf spot'
          : 'Surf spot'

    pinElement.classList.toggle('map-marker-pin-selected', isSelected)
    pinElement.style.zIndex = isSelected ? '3' : '2'
    pinElement.setAttribute('aria-pressed', String(isSelected))
    pinElement.setAttribute('aria-label', ariaLabel)
  })
}

export const EndSessionSpotMap = memo((props: EndSessionSpotMapProps) => {
  const { sessionCoordinates, nearbySpots, selectedSpotId, onOpenSpotPreview } =
    props
  const { settings } = useSettingsContext()
  const { preferredUnits } = settings
  const sessionMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const spotMarkersRef = useRef<Map<string, HTMLDivElement>>(new Map())
  const spotMarkerInstancesRef = useRef<mapboxgl.Marker[]>([])
  const onOpenSpotPreviewRef = useRef(onOpenSpotPreview)
  const selectedSpotIdRef = useRef(selectedSpotId)
  const sessionCoordinatesRef = useRef(sessionCoordinates)
  const renderSpotMarkersRef = useRef<(map: mapboxgl.Map) => void>(() => {})
  const fitMapToSessionAndSpotsRef = useRef<(map: mapboxgl.Map) => void>(
    () => {},
  )

  onOpenSpotPreviewRef.current = onOpenSpotPreview
  selectedSpotIdRef.current = selectedSpotId
  sessionCoordinatesRef.current = sessionCoordinates

  const showSessionSurfedMarker = useMemo(() => {
    if (selectedSpotId === '') {
      return true
    }

    const selectedSpot =
      nearbySpots.find(
        (spot) => spot.id != null && String(spot.id) === selectedSpotId,
      ) ?? null

    if (selectedSpot == null) {
      return true
    }

    return selectedSpot.distanceKm > AT_SPOT_RADIUS_KM
  }, [nearbySpots, selectedSpotId])

  const fitMapToSessionAndSpots = useCallback(
    (map: mapboxgl.Map) => {
      const coordinates: Coordinates[] = [sessionCoordinates]

      nearbySpots.forEach((spot) => {
        if (spot.latitude != null && spot.longitude != null) {
          coordinates.push({
            latitude: spot.latitude,
            longitude: spot.longitude,
          })
        }
      })

      fitMapToCoordinates(map, coordinates, {
        padding: 56,
        maxZoom: 14,
        duration: 800,
      })
    },
    [nearbySpots, sessionCoordinates],
  )

  const clearSpotMarkers = useCallback(() => {
    removeDomMarkers(spotMarkerInstancesRef.current)
    spotMarkerInstancesRef.current = []
    spotMarkersRef.current.clear()
  }, [])

  const renderSpotMarkers = useCallback(
    (map: mapboxgl.Map) => {
      clearSpotMarkers()

      nearbySpots.forEach((spot) => {
        if (
          spot.id == null ||
          spot.latitude == null ||
          spot.longitude == null
        ) {
          return
        }

        const spotId = String(spot.id)
        const isSelected = spotId === selectedSpotIdRef.current
        const pinElement = createDomMarkerElement(
          [
            'map-marker-pin',
            isSelected ? 'map-marker-pin-selected' : '',
          ],
          {
            role: 'button',
            tabIndex: 0,
            ariaPressed: isSelected,
            ariaLabel: buildEndSessionSpotPinLabel(
              spot,
              isSelected,
              preferredUnits,
            ),
            zIndex: isSelected ? '3' : '2',
          },
        )

        attachDomMarkerButton(pinElement, () =>
          onOpenSpotPreviewRef.current(spot),
        )

        const marker = addDomMarker(
          map,
          { latitude: spot.latitude, longitude: spot.longitude },
          pinElement,
        )

        spotMarkersRef.current.set(spotId, pinElement)
        spotMarkerInstancesRef.current.push(marker)
      })
    },
    [clearSpotMarkers, nearbySpots, preferredUnits],
  )

  renderSpotMarkersRef.current = renderSpotMarkers
  fitMapToSessionAndSpotsRef.current = fitMapToSessionAndSpots

  const handleMapLoad = useCallback((map: mapboxgl.Map) => {
    const sessionMarkerElement = createDomMarkerElement(
      'map-marker-dot-pulse',
      { ariaHidden: true, zIndex: '1' },
    )

    sessionMarkerRef.current = addDomMarker(
      map,
      sessionCoordinatesRef.current,
      sessionMarkerElement,
    )

    renderSpotMarkersRef.current(map)
    fitMapToSessionAndSpotsRef.current(map)
  }, [])

  const handleMapCleanup = useCallback(() => {
    clearSpotMarkers()
    if (sessionMarkerRef.current) {
      sessionMarkerRef.current.remove()
      sessionMarkerRef.current = null
    }
  }, [clearSpotMarkers])

  const { mapContainerRef, mapRef, loading } = useMapInstance({
    interactive: true,
    initialCenter: sessionCoordinates,
    onLoad: handleMapLoad,
    onCleanup: handleMapCleanup,
  })

  useEffect(() => {
    const map = mapRef.current
    if (map == null || map._removed || loading) {
      return
    }

    renderSpotMarkers(map)
    fitMapToSessionAndSpots(map)
  }, [fitMapToSessionAndSpots, loading, mapRef, nearbySpots, renderSpotMarkers])

  useEffect(() => {
    updateSpotPinSelection(
      spotMarkersRef.current,
      selectedSpotId,
      nearbySpots,
      preferredUnits,
    )
  }, [nearbySpots, preferredUnits, selectedSpotId])

  useEffect(() => {
    const sessionMarker = sessionMarkerRef.current
    if (sessionMarker == null) {
      return
    }

    sessionMarker.getElement().style.display = showSessionSurfedMarker
      ? ''
      : 'none'
  }, [showSessionSurfedMarker])

  return (
    <ErrorBoundary message={ERROR_BOUNDARY_MAP}>
      <div className="find-spot-map session-inline-map end-session-spot-map">
        <div className={classNames('map-container', { border: !loading })}>
          <div
            ref={mapContainerRef}
            className={classNames('map', { 'map-visible': !loading })}
          />
          {loading && <SkeletonLoader />}
          {!loading && (
            <div className="map-instructions-overlay">
              Choose a nearby pin to select a spot.
            </div>
          )}
        </div>
        {!loading && (
          <ul className="end-session-spot-map-legend" aria-label="Map legend">
            {showSessionSurfedMarker && (
              <li className="end-session-spot-map-legend-item font-x-small text-secondary">
                <span className="map-marker-dot-legend" aria-hidden="true" />
                Where you surfed
              </li>
            )}
            <li className="end-session-spot-map-legend-item font-x-small text-secondary">
              <span className="map-marker-pin-legend" aria-hidden="true" />
              Surf spots
            </li>
            <li className="end-session-spot-map-legend-item font-x-small text-secondary">
              <span
                className="map-marker-pin-legend-selected"
                aria-hidden="true"
              />
              Selected spot
            </li>
          </ul>
        )}
      </div>
    </ErrorBoundary>
  )
})

export default EndSessionSpotMap
