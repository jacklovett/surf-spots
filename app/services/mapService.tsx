import { createRoot } from 'react-dom/client'
import mapboxgl from 'mapbox-gl'
import { BoundingBox, Coordinates, SurfSpot } from '~/types/surfSpots'
import { post } from './networkService'
import { SurfSpotPopUp } from '~/components'

export const MAP_ACCESS_TOKEN = import.meta.env.VITE_MAP_ACCESS_TOKEN

export const defaultMapCenter = {
  longitude: -9.2398383,
  latitude: 38.6429801,
}

export const fetchSurfSpotsByBounds = async (
  map: mapboxgl.Map,
): Promise<SurfSpot[]> => {
  const bounds = map.getBounds()

  if (!bounds) {
    console.log('Map bounds not received.')
    return []
  }

  const boundingBox = {
    minLongitude: bounds.getSouthWest().lng,
    maxLongitude: bounds.getNorthEast().lng,
    minLatitude: bounds.getSouthWest().lat,
    maxLatitude: bounds.getNorthEast().lat,
  }

  let surfSpots = null

  try {
    surfSpots = await post<BoundingBox, SurfSpot[]>(
      `surf-spots/within-bounds`,
      boundingBox,
    )
  } catch (error) {
    console.error('Error fetching surf spots:', error)
  } finally {
    return surfSpots ?? []
  }
}

/**
 * Simple add marker function used to plot coordinate when no extras are needed.
 * Used for surf details page where we don't need additional pop up
 * @param coordinates - coordinates of surf spot to plot
 * @param map - map element to plot marker to
 * @returns
 */
export const addMarkerForCoordinate = (
  coordinates: Coordinates,
  map: mapboxgl.Map,
) => createMarker(coordinates).addTo(map)

export const addMarkersForSurfSpots = (
  surfSpots: SurfSpot[],
  map: mapboxgl.Map,
  onNavigate: (path: string) => void,
) =>
  surfSpots.forEach((spot: SurfSpot) =>
    addMarkerForSurfSpot(spot, map, onNavigate),
  )

const addMarkerForSurfSpot = (
  surfSpot: SurfSpot,
  map: mapboxgl.Map,
  onNavigate: (path: string) => void,
) => {
  const popupContainer = document.createElement('div')

  try {
    createRoot(popupContainer).render(
      <SurfSpotPopUp surfSpot={surfSpot} onNavigate={onNavigate} />,
    )
  } catch (error) {
    console.error('Error rendering SurfSpotPopUp:', error)
  }

  const popup = new mapboxgl.Popup({
    maxWidth: '370px',
    focusAfterOpen: false,
  }).setDOMContent(popupContainer)

  const { longitude, latitude, name } = surfSpot

  if (!longitude && !latitude) {
    throw new Error(`Unable to plot market for ${name}: No coordinates found`)
  }
  // Create and place the marker
  createMarker({ longitude, latitude })
    .setPopup(popup) // Set the popup to the marker
    .addTo(map)
}

const createMarker = (coordinates: Coordinates): mapboxgl.Marker => {
  const { longitude, latitude } = coordinates
  return new mapboxgl.Marker({
    color: '#046380', // TODO: Get dynamically from set color theme
    scale: 0.75,
  }).setLngLat({ lng: longitude, lat: latitude })
}
