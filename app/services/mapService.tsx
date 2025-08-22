import mapboxgl, {
  GeoJSONSourceSpecification,
  Map,
  MapMouseEvent,
} from 'mapbox-gl'
import {
  BoundingBox,
  Coordinates,
  Region,
  SurfSpot,
  SurfSpotFilters,
} from '~/types/surfSpots'
import { get, post } from './networkService'
import { getCssVariable } from '~/utils'

export const MAP_ACCESS_TOKEN = import.meta.env.VITE_MAP_ACCESS_TOKEN
export const ICON_IMAGE_PATH = `/images/png/pin.png`

export const defaultMapCenter = {
  longitude: -9.2398383,
  latitude: 38.6429801,
}

/**
 * Fetch Region from backend that the chosen location is contained withint
 */
export const getRegionFromLocationData = async (
  country: string,
  longitude: number,
  latitude: number,
): Promise<Region | null> => {
  try {
    const region = await get<Region>(
      `/regions?country=${country}&longitude=${longitude}&latitude=${latitude}`,
    )
    return region
  } catch (e) {
    console.error('Unable to get region from location data: ', e)
    return null
  }
}

export const fetchSurfSpotsByBounds = async (
  map: mapboxgl.Map,
  userId?: string,
  filters?: SurfSpotFilters,
): Promise<SurfSpot[]> => {
  try {
    const bounds = map.getBounds()
    if (!bounds) {
      throw new Error('Map bounds not available.')
    }
    const boundingBox: BoundingBox = {
      minLongitude: bounds.getSouthWest().lng,
      maxLongitude: bounds.getNorthEast().lng,
      minLatitude: bounds.getSouthWest().lat,
      maxLatitude: bounds.getNorthEast().lat,
    }

    // Only spread filters if provided
    const payload = filters
      ? { ...boundingBox, ...filters, userId }
      : { ...boundingBox, userId }
    return await post<
      BoundingBox & Partial<SurfSpotFilters> & { userId?: string },
      SurfSpot[]
    >('surf-spots/within-bounds', payload)
  } catch (e) {
    console.error('Unable to fetch surf spots by bounds:', e)
    return []
  }
}

/**
 * Initializes the Mapbox map with a given container and options.
 * @param mapContainer - the map container element
 * @param interactive - determines if the map is interactive or static
 * @param coordinates - optional initial coordinates for the map center
 * @returns The initialized Mapbox map
 */
export const initializeMap = (
  mapContainer: HTMLDivElement,
  interactive: boolean,
  coordinates?: Coordinates,
): Map => {
  if (!mapContainer) {
    throw new Error('No container provided for map initialization.')
  }

  mapboxgl.accessToken = MAP_ACCESS_TOKEN

  const initLongitude = coordinates?.longitude ?? defaultMapCenter.longitude
  const initLatitude = coordinates?.latitude ?? defaultMapCenter.latitude

  return new mapboxgl.Map({
    container: mapContainer,
    style: 'mapbox://styles/mapbox/light-v11',
    center: [initLongitude, initLatitude],
    zoom: 12,
    minZoom: 2,
    maxZoom: 15,
    interactive,
    scrollZoom: interactive,
    dragPan: interactive,
    doubleClickZoom: interactive,
    boxZoom: interactive,
    touchZoomRotate: interactive,
    cooperativeGestures: true,
    preserveDrawingBuffer: false,
  })
}

/**
 * Adds a source containing surf spots to the map.
 * @param map - the initialized map
 * @param surfSpots - the array of surf spots to be added
 */
export const addSourceData = (map: Map, surfSpots: SurfSpot[]) =>
  map.addSource('surfSpots', createSurfSpotsSource(surfSpots))

/**
 * Converts surf spots data into a GeoJSON source format for Mapbox.
 * @param surfSpots - array of surf spots
 */
const createSurfSpotsSource = (
  surfSpots: SurfSpot[],
): GeoJSONSourceSpecification => ({
  type: 'geojson',
  data: getSourceData(surfSpots),
  cluster: true,
  clusterMaxZoom: 15,
  clusterRadius: 50,
})

/**
 * Converts surf spots data into a GeoJSON format.
 * @param surfSpots - array of surf spots
 * @returns The GeoJSON object
 */
export const getSourceData = (surfSpots: SurfSpot[]): GeoJSON.GeoJSON => ({
  type: 'FeatureCollection',
  features: surfSpots.map((spot) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [spot.longitude, spot.latitude],
    },
    properties: {
      surfSpot: spot,
    },
  })),
})

/**
 * Adds layers for clustered and unclustered points on the map.
 * @param map - the initialized map
 * @param onMarkerClick - function to handle marker click
 */
export const addLayers = (
  map: Map,
  onMarkerClick: (event: MapMouseEvent) => void,
) => {
  addClusterLayers(map)
  addMarkerLayers(map)
  setupLayerInteractions(map, onMarkerClick)
}

/**
 * Adds cluster and marker layers to the map.
 * @param map - the initialized map
 * @param onMarkerClick - function to handle marker click
 */
const addClusterLayers = (map: Map) => {
  const primaryColor = getCssVariable('--primary-color')
  const accentColor = getCssVariable('--accent-color')

  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'surfSpots',
    filter: ['has', 'point_count'],
    paint: {
      'circle-radius': ['step', ['get', 'point_count'], 16, 100, 25, 750, 35],
      'circle-color': primaryColor,
      'circle-opacity': 0.8,
      'circle-stroke-width': 3,
      'circle-stroke-color': accentColor,
    },
  })

  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'surfSpots',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 14,
      'text-allow-overlap': true, // Ensure text doesn't overlap
    },
    paint: {
      'text-color': '#ffffff', // White text for contrast
    },
  })
}

const addMarkerLayers = (map: Map) => {
  // Load the pin icon image
  map.loadImage(`/images/png/pin.png`, (error, image) => {
    if (error) throw error

    if (!image) {
      throw new Error('No icon image found!')
    }

    // Add the custom image to the map
    map.addImage('custom-pin', image)
    // Add a layer using the custom icon
    map.addLayer({
      id: 'marker',
      type: 'symbol',
      source: 'surfSpots',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': 'custom-pin', // Use the custom icon
        'icon-size': 0.5, // Adjust size as needed
        'icon-allow-overlap': true,
      },
    })
  })
}

/**
 * Handles a click event on a cluster of surf spots.
 * @param map - the initialized map
 * @param event - the Mapbox mouse event
 */
const handleClusterClick = (map: Map, event: MapMouseEvent) => {
  try {
    const features = map.queryRenderedFeatures(event.point, {
      layers: ['clusters'],
    })
    const feature = features[0]

    if (!feature || !feature.properties) {
      console.error('No cluster features found.')
      return
    }

    const clusterId = feature.properties.cluster_id
    const source = map.getSource('surfSpots') as mapboxgl.GeoJSONSource

    source.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) {
        console.error('Error getting cluster expansion zoom:', err)
        return
      }
      if (!zoom) {
        console.error('No zoom level available for cluster expansion.')
        return
      }

      if (feature.geometry.type === 'Point') {
        map.easeTo({
          center: feature.geometry.coordinates as [number, number],
          zoom,
        })
      } else {
        console.error('Feature geometry is not a point.')
      }
    })
  } catch (error) {
    console.error('Error handling cluster click:', error)
  }
}
/**
 * Sets up interactions for cluster and marker layers.
 * @param map - the initialized map
 * @param onMarkerClick - function to handle marker click
 */
const setupLayerInteractions = (
  map: Map,
  onMarkerClick: (event: MapMouseEvent) => void,
) => {
  map.on('click', 'clusters', (event) => handleClusterClick(map, event))
  map.on('click', 'marker', onMarkerClick)

  const setCursorStyle = (cursor: string) => () =>
    (map.getCanvas().style.cursor = cursor)

  map.on('mouseenter', ['clusters', 'marker'], setCursorStyle('pointer'))
  map.on('mouseleave', ['clusters', 'marker'], setCursorStyle(''))
}

/**
 * Simple add marker function used to plot coordinate when no extras are needed.
 * Used for surf details page where we don't need additional pop up
 * @param coordinates - coordinates of surf spot to plot
 * @param map - map element to plot marker to
 * @returns
 **/
export const addMarkerForCoordinate = (coordinates: Coordinates, map: Map) => {
  // Load the pin icon image
  map.loadImage(ICON_IMAGE_PATH, (error, image) => {
    if (error) {
      console.error('Error loading pin image:', error)
      return
    }

    if (!image) {
      console.error('No icon image found for marker!')
      return
    }

    // Add the custom image to the map
    map.addImage('custom-pin', image)
    // Create the marker using the custom pin image
    new mapboxgl.Marker({
      element: createMarkerElement(),
    })
      .setLngLat([coordinates.longitude, coordinates.latitude])
      .addTo(map)
  })
}

// Helper function to create a marker element
const createMarkerElement = () => {
  const markerDiv = document.createElement('div')
  markerDiv.style.backgroundImage = `url(${ICON_IMAGE_PATH})`
  markerDiv.style.width = '42px'
  markerDiv.style.height = '42px'
  markerDiv.style.backgroundSize = 'contain'
  markerDiv.style.backgroundRepeat = 'no-repeat'
  return markerDiv
}

export const removeSource = (map: Map) => {
  try {
    // Check if source exists before trying to remove it
    const source = map.getSource('surfSpots')
    if (!source) {
      // Source doesn't exist, which is fine - just return silently
      return
    }

    // Check if layers exist before removing them
    if (map.getLayer('clusters')) {
      map.removeLayer('clusters')
    }
    if (map.getLayer('cluster-count')) {
      map.removeLayer('cluster-count')
    }
    if (map.getLayer('marker')) {
      map.removeLayer('marker')
    }

    // Remove the source
    map.removeSource('surfSpots')
  } catch (error) {
    // Log error but don't throw - this is cleanup code
    console.warn('Error during map cleanup:', error)
  }
}
