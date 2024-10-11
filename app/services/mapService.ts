import mapboxgl from 'mapbox-gl'
import { Coordinates, SurfSpot } from '~/types/surfSpots'

export const MAP_ACCESS_TOKEN = import.meta.env.VITE_MAP_ACCESS_TOKEN

export const defaultMapCenter = {
  longitude: -9.2398383,
  latitude: 38.6429801,
}

export const addMarkerForCoordinate = (
  coordinates: Coordinates,
  map: mapboxgl.Map,
) => {
  const { longitude, latitude } = coordinates
  new mapboxgl.Marker({
    color: '#046380', // TODO: Get dynamically from set color theme
    scale: 0.5,
  })
    .setLngLat({ lng: longitude, lat: latitude })
    .addTo(map)
}

export const addMarkersForSurfSpots = (
  surfSpots: SurfSpot[],
  map: mapboxgl.Map,
) => {
  surfSpots.forEach((spot: SurfSpot) => {
    const { name, longitude, latitude } = spot

    if (!longitude && !latitude) {
      throw new Error(`Unable to plot market for ${name}: No coordinates found`)
    }

    addMarkerForCoordinate({ longitude, latitude }, map)
  })
}
