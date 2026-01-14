import mapboxgl, {
  GeoJSONSourceSpecification,
} from 'mapbox-gl'
import type {
  BoundingBox,
  Coordinates,
  SurfSpot,
  SurfSpotFilters,
  MapboxReverseGeocodeResult,
  RegionCountryLookupResponse,
} from '~/types/surfSpots'
import { NetworkError, post } from './networkService'
import { getCssVariable } from '~/utils/commonUtils'
import {
  convertFiltersToBackendFormat,
  type BackendFilterFormat,
} from '~/utils/filterUtils'

export const MAP_ACCESS_TOKEN = import.meta.env.VITE_MAP_ACCESS_TOKEN
export const ICON_IMAGE_PATH = `/images/png/pin.png`

export const defaultMapCenter = {
  longitude: -9.2398383,
  latitude: 38.6429801,
}

/**
 * Calculate bounds from a set of surf spots and fit the map to show all spots.
 * Handles edge cases like single spots, spots at same location, etc.
 * @param map - The Mapbox map instance
 * @param surfSpots - Array of surf spots
 * @param padding - Optional padding in pixels (default: 48)
 */
export const fitMapToSurfSpots = (
  map: mapboxgl.Map,
  surfSpots: SurfSpot[],
  padding: number = 48,
): void => {
  if (!surfSpots || surfSpots.length === 0) {
    return
  }

  const longitudes = surfSpots.map((spot) => spot.longitude)
  const latitudes = surfSpots.map((spot) => spot.latitude)

  const minLng = Math.min(...longitudes)
  const maxLng = Math.max(...longitudes)
  const minLat = Math.min(...latitudes)
  const maxLat = Math.max(...latitudes)

  const lngRange = maxLng - minLng
  const latRange = maxLat - minLat

  // If all points are at the same location (or very close), center on it with a reasonable zoom
  if (lngRange < 0.001 && latRange < 0.001) {
    map.easeTo({
      center: [surfSpots[0].longitude, surfSpots[0].latitude],
      zoom: 12, // Reasonable zoom level for a single spot
      duration: 1000,
    })
    return
  }

  // Create bounds with minimum size to ensure visibility
  // Add a small buffer to prevent bounds from being too tight
  const minBuffer = 0.01 // ~1km buffer
  const bufferedMinLng = minLng - Math.max(minBuffer, lngRange * 0.1)
  const bufferedMaxLng = maxLng + Math.max(minBuffer, lngRange * 0.1)
  const bufferedMinLat = minLat - Math.max(minBuffer, latRange * 0.1)
  const bufferedMaxLat = maxLat + Math.max(minBuffer, latRange * 0.1)

  // Fit bounds to show all spots with padding
  map.fitBounds(
    [
      [bufferedMinLng, bufferedMinLat], // Southwest corner
      [bufferedMaxLng, bufferedMaxLat], // Northeast corner
    ],
    {
      padding: {
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
      },
      maxZoom: 15, // Don't zoom in too close
      duration: 1000, // Smooth animation
    },
  )
}

/**
 * Calculate distance between two coordinates using the Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Reverse geocode coordinates using Mapbox API to get country information
 * @param longitude - The longitude coordinate
 * @param latitude - The latitude coordinate
 * @returns Country name and continent, or null if not found
 */
export const reverseGeocodeWithMapbox = async (
  longitude: number,
  latitude: number,
): Promise<MapboxReverseGeocodeResult | null> => {
  // Only run on client side (not during SSR)
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const accessToken = MAP_ACCESS_TOKEN
    if (!accessToken) {
      console.error(
        '[Mapbox Reverse Geocoding] Mapbox access token not configured',
      )
      return null
    }

    // Mapbox reverse geocoding API
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}&types=country`,
    )
    if (!response.ok) {
      console.error(
        `[Mapbox Reverse Geocoding] API request failed: ${response.statusText}`,
      )
      return null
    }

    const data = await response.json()

    // Find country in the results
    const countryFeature = data.features?.find(
      (feature: { place_type?: string[] }) =>
        feature.place_type?.includes('country'),
    )

    if (!countryFeature) {
      return null
    }

    // Extract country name from context or text
    const countryName = countryFeature.text || countryFeature.properties?.name
    // Try to find continent from context (Mapbox sometimes includes it)
    const continentFeature = data.features?.find(
      (feature: { place_type?: string[] }) =>
        feature.place_type?.includes('continent'),
    )
    const continentName =
      continentFeature?.text || continentFeature?.properties?.name

    return {
      country: countryName,
      continent: continentName,
    }
  } catch (e) {
    console.error('[Mapbox Reverse Geocoding] Error:', e)
    return null
  }
}

/**
 * Fetch Region and Country from coordinates (longitude/latitude)
 * Uses hybrid approach: Mapbox for country name, then single backend call for both country and region
 *
 * Strategy:
 * 1. Use Mapbox reverse geocoding to get country name (fast, accurate, helps with country borders)
 * 2. Single backend call that finds country by name and region by coordinates
 *
 * @param longitude - The longitude coordinate
 * @param latitude - The latitude coordinate
 * @returns Object with region and country, or null if country not found
 */
export const getRegionAndCountryFromCoordinates = async (
  longitude: number,
  latitude: number,
): Promise<RegionCountryLookupResponse> => {
  try {
    // Step 1: Use Mapbox to get country name (fast, accurate, helps with country borders)
    const mapboxResult = await reverseGeocodeWithMapbox(longitude, latitude)

    if (!mapboxResult?.country) {
      // No country from Mapbox - return null for both
      console.warn(
        `[Region Lookup] Mapbox returned no country for ${longitude}, ${latitude}`,
      )
      return { region: null, country: null, continent: null }
    }

    // Step 2: Single backend call to get both country and region
    const countryName = mapboxResult.country.toLowerCase().trim()

    try {
      // Using POST to avoid route conflict with GET /{regionSlug}
      // This endpoint is public according to backend config (/api/regions/**)
      const result = await post<
        {
          longitude: number
          latitude: number
          countryName: string
        },
        RegionCountryLookupResponse
      >('regions/by-coordinates', {
        longitude,
        latitude,
        countryName,
      })

      // Backend returns both region and country (country is always present if result exists)
      return result
    } catch (error) {
      // If country lookup fails, don't continue - country is required
      const networkError = error as NetworkError

      // Enhanced error logging for production debugging
      console.error('[Region Lookup] Backend API call failed:', {
        url: 'regions/by-coordinates',
        mapboxCountry: mapboxResult.country,
        normalizedCountry: countryName,
        errorStatus: networkError?.status,
        errorMessage: networkError?.message || String(error),
        apiUrlConfigured: !!import.meta.env.VITE_API_URL,
      })

      if (networkError?.status === 401) {
        // 401 Unauthorized - likely a session cookie issue in production
        // This endpoint should be public, so this indicates a backend configuration issue
        console.error(
          '[Region Lookup] 401 Unauthorized - This endpoint should be public. ' +
            'Check backend SessionCookieFilter configuration and CORS settings.',
        )
        return { region: null, country: null, continent: null }
      }

      if (networkError?.status === 404) {
        // Country not found in database - this shouldn't happen, but handle gracefully
        console.error(
          `[Region Lookup] Country "${countryName}" (from Mapbox: "${mapboxResult.country}") not found in database`,
        )
        return { region: null, country: null, continent: null }
      }
      // For other errors, log and return null
      return { region: null, country: null, continent: null }
    }
  } catch (error) {
    console.error(
      '[Region Lookup] Unexpected error in getRegionAndCountryFromCoordinates:',
      error,
    )
    return { region: null, country: null, continent: null }
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

    // Convert filters to backend format if provided
    const backendFilters = filters ? convertFiltersToBackendFormat(filters) : {}
    const payload = { ...boundingBox, ...backendFilters }
    if (userId) {
      payload.userId = userId
    }
    return await post<
      BoundingBox & Partial<BackendFilterFormat> & { userId?: string },
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
): mapboxgl.Map => {
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
export const addSourceData = (map: mapboxgl.Map, surfSpots: SurfSpot[]) =>
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
  map: mapboxgl.Map,
  onMarkerClick: (event: mapboxgl.MapMouseEvent) => void,
) => {
  addClusterLayers(map)
  // Then add marker layers (these depend on image loading)
  addMarkerLayers(map)
  // Set up interactions after all layers are added
  setupLayerInteractions(map, onMarkerClick)
}

/**
 * Adds cluster and marker layers to the map.
 * @param map - the initialized map
 * @param onMarkerClick - function to handle marker click
 */
const addClusterLayers = (map: mapboxgl.Map) => {
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

const addMarkerLayers = (map: mapboxgl.Map) => {
  // Check if source exists before trying to add layers
  const source = map.getSource('surfSpots')
  if (!source) {
    console.warn('SurfSpots source not found, skipping marker layers')
    return
  }

  // Load the pin icon image
  map.loadImage(`/images/png/pin.png`, (error, image) => {
    if (error) {
      console.error('Error loading pin image:', error)
      return
    }

    if (!image) {
      console.error('No icon image found!')
      return
    }

    // Check again if source still exists (map might have been reinitialized)
    const currentSource = map.getSource('surfSpots')
    if (!currentSource) {
      console.warn('Surf spots source no longer exists, skipping marker layer')
      return
    }

    // Add the custom image to the map
    map.addImage('custom-pin', image)

    // Add a layer using the custom icon
    try {
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
    } catch (error) {
      console.error('Error adding marker layer:', error)
    }
  })
}

/**
 * Handles a click event on a cluster of surf spots.
 * @param map - the initialized map
 * @param event - the Mapbox mouse event
 */
const handleClusterClick = (map: mapboxgl.Map, event: mapboxgl.MapMouseEvent) => {
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
  map: mapboxgl.Map,
  onMarkerClick: (event: mapboxgl.MapMouseEvent) => void,
) => {
  map.on('click', 'clusters', (event) => handleClusterClick(map, event))
  map.on('click', 'marker', (event) => {
    // Prevent any default behavior and ensure our handler runs
    event.preventDefault?.()
    onMarkerClick(event)
  })

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
export const addMarkerForCoordinate = (coordinates: Coordinates, map: mapboxgl.Map) => {
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
      element: createPinElement(),
    })
      .setLngLat([coordinates.longitude, coordinates.latitude])
      .addTo(map)
  })
}

/**
 * Creates a styled pin element for map markers
 * @param size - Optional size in pixels (default: 42px)
 * @returns HTMLDivElement with pin styling
 */
export const createPinElement = (size: number = 42) => {
  if (typeof document === 'undefined') {
    throw new Error('createPinElement can only be called on the client')
  }
  const markerDiv = document.createElement('div')
  markerDiv.className = 'custom-pin'
  markerDiv.style.width = `${size}px`
  markerDiv.style.height = `${size}px`
  markerDiv.style.backgroundImage = `url(${ICON_IMAGE_PATH})`
  markerDiv.style.backgroundSize = 'contain'
  markerDiv.style.backgroundRepeat = 'no-repeat'
  markerDiv.style.backgroundPosition = 'center'
  return markerDiv
}

/**
 * Updates the surf spots data in the map source
 * @param map - the map instance
 * @param surfSpots - array of surf spots to display
 */
export const updateMapSourceData = (map: mapboxgl.Map, surfSpots: SurfSpot[]): void => {
  const source = map.getSource('surfSpots') as mapboxgl.GeoJSONSource
  if (source) {
    source.setData(getSourceData(surfSpots))
  }
}

export const removeSource = (map: mapboxgl.Map) => {
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
