import { useState, useEffect, useRef, useCallback } from 'react'
import {
  getRegionAndCountryFromCoordinates,
  calculateDistance,
} from '~/services/mapService'
import { get } from '~/services/networkService'
import {
  Country,
  Region,
  Coordinates,
  SurfSpotFormState,
} from '~/types/surfSpots'
import type { AddSurfSpotMapRef } from '~/components/SurfMap/AddSurfSpotMap'
import { useToastContext } from '~/contexts'
import { ERROR_DETERMINE_REGION } from '~/utils/errorUtils'

type FormChangeHandler = <K extends keyof SurfSpotFormState>(
  field: K,
  value: SurfSpotFormState[K],
) => void

interface UseLocationSelectionProps {
  findOnMap: boolean
  longitude?: number
  latitude?: number
  continent: string
  country: string
  region: string
  initialSurfSpot?: {
    continent?: { slug: string }
    country?: { id: string }
  }
  onLocationChange: FormChangeHandler
  initialUserLocation?: Coordinates | null
}

export const useLocationSelection = ({
  findOnMap,
  longitude,
  latitude,
  continent,
  country,
  region,
  initialSurfSpot,
  onLocationChange,
  initialUserLocation,
}: UseLocationSelectionProps) => {
  const { showError } = useToastContext()
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([])
  const [filteredRegions, setFilteredRegions] = useState<Region[]>([])
  const filteredCountriesRef = useRef<Country[]>([])
  const filteredRegionsRef = useRef<Region[]>([])
  const mapRef = useRef<AddSurfSpotMapRef>(null!)
  const [isMapReady, setIsMapReady] = useState(false)
  const [isDeterminingLocation, setIsDeterminingLocation] = useState(false)
  const [regionNotFoundMessage, setRegionNotFoundMessage] = useState<
    string | null
  >(null)
  const [countryName, setCountryName] = useState<string>('')
  const [regionName, setRegionName] = useState<string>('')
  const [userLocation, setUserLocation] = useState<Coordinates | null>(
    initialUserLocation || null,
  )

  // Update user location when initialUserLocation changes
  useEffect(() => {
    if (initialUserLocation) {
      setUserLocation(initialUserLocation)
    }
  }, [initialUserLocation])

  const clearedCountryRef = useRef<string | null>(null)
  const isAutoFillingRef = useRef(false)
  const pendingCountryIdRef = useRef<string | null>(null)
  const pendingRegionIdRef = useRef<string | null>(null)
  const previousCoordsRef = useRef<{
    longitude: number
    latitude: number
  } | null>(null)
  const onLocationChangeRef = useRef(onLocationChange)

  // Keep ref updated with latest callback
  useEffect(() => {
    onLocationChangeRef.current = onLocationChange
  }, [onLocationChange])

  // Fetch initial countries/regions when editing
  useEffect(() => {
    const continentSlug = initialSurfSpot?.continent?.slug
    const countryId = initialSurfSpot?.country?.id

    if (continentSlug) {
      const fetchInitialCountries = async () => {
        try {
          const countries = await get<Country[]>(
            `countries/continent/${continentSlug}`,
          )
          setFilteredCountries(countries)
          filteredCountriesRef.current = countries

          if (countryId) {
            try {
              const regions = await get<Region[]>(
                `regions/country/${countryId}`,
              )
              setFilteredRegions(regions)
              filteredRegionsRef.current = regions
            } catch (error) {
              console.error('Error fetching regions for edit:', error)
            }
          }
        } catch (error) {
          console.error('Error fetching countries for edit:', error)
        }
      }
      fetchInitialCountries()
    }
  }, [initialSurfSpot?.continent?.slug, initialSurfSpot?.country?.id])

  // Fetch countries when continent changes
  useEffect(() => {
    const fetchCountries = async () => {
      if (continent) {
        try {
          const countries = await get<Country[]>(
            `countries/continent/${continent}`,
          )
          setFilteredCountries(countries)
          filteredCountriesRef.current = countries

          if (pendingCountryIdRef.current) {
            onLocationChangeRef.current('country', pendingCountryIdRef.current)
            pendingCountryIdRef.current = null
          }
        } catch (error) {
          console.error('Error fetching countries:', error)
          if (isAutoFillingRef.current) {
            setIsDeterminingLocation(false)
            isAutoFillingRef.current = false
          }
        }
      } else {
        if (!findOnMap) {
          setFilteredCountries([])
          setFilteredRegions([])
          setIsDeterminingLocation(false)
        }
      }
    }

    fetchCountries()
  }, [continent, findOnMap])

  // Fetch regions when country changes
  useEffect(() => {
    const fetchRegions = async () => {
      if (country) {
        try {
          const regions = await get<Region[]>(`regions/country/${country}`)
          setFilteredRegions(regions)
          filteredRegionsRef.current = regions

          if (pendingRegionIdRef.current) {
            onLocationChangeRef.current('region', pendingRegionIdRef.current)
            pendingRegionIdRef.current = null
          }
        } catch (error) {
          console.error('Error fetching regions:', error)
          if (isAutoFillingRef.current) {
            setIsDeterminingLocation(false)
            isAutoFillingRef.current = false
          }
        }
      } else {
        setFilteredRegions([])
        if (!isAutoFillingRef.current) {
          setIsDeterminingLocation(false)
        }
      }
    }

    fetchRegions()
  }, [country])

  // Clear determining state when both country and region are set
  useEffect(() => {
    if (!isAutoFillingRef.current || !isDeterminingLocation) {
      return
    }

    const stillWaiting =
      pendingCountryIdRef.current || pendingRegionIdRef.current
    if (stillWaiting) {
      return
    }

    const bothSet = country && region
    if (bothSet) {
      setIsDeterminingLocation(false)
      isAutoFillingRef.current = false
      return
    }

    const countrySetNoRegion =
      country &&
      !region &&
      (regionNotFoundMessage ||
        (filteredRegionsRef.current.length === 0 &&
          country &&
          !pendingRegionIdRef.current))
    if (countrySetNoRegion) {
      setIsDeterminingLocation(false)
      isAutoFillingRef.current = false
    }
  }, [country, region, isDeterminingLocation, regionNotFoundMessage])

  // Handle coordinate changes in map mode
  useEffect(() => {
    if (!findOnMap || !longitude || !latitude) {
      setIsDeterminingLocation(false)
      return
    }

    // Check if coordinates have actually changed (avoid infinite loops)
    const coordsChanged =
      !previousCoordsRef.current ||
      previousCoordsRef.current.longitude !== longitude ||
      previousCoordsRef.current.latitude !== latitude

    if (!coordsChanged) {
      return
    }

    const distance = previousCoordsRef.current
      ? calculateDistance(
          previousCoordsRef.current.latitude,
          previousCoordsRef.current.longitude,
          latitude,
          longitude,
        )
      : 0
    const hasMovedForRegion = distance > 30
    const hasMovedForCountry = distance > 50

    isAutoFillingRef.current = true
    pendingCountryIdRef.current = null
    pendingRegionIdRef.current = null
    setCountryName('')
    setRegionName('')
    setRegionNotFoundMessage(null)
    setIsDeterminingLocation(true)

    if (previousCoordsRef.current && distance > 0) {
      if (hasMovedForRegion && region) {
        onLocationChangeRef.current('region', '')
      }

      if (hasMovedForCountry && country) {
        clearedCountryRef.current = country
        onLocationChangeRef.current('country', '')
      } else if (country) {
        clearedCountryRef.current = country
        onLocationChangeRef.current('country', '')
        if (region) {
          onLocationChangeRef.current('region', '')
        }
      }
    }

    const debounceTimer = setTimeout(async () => {
      try {
        const response = await getRegionAndCountryFromCoordinates(
          longitude,
          latitude,
        )

        const {
          region: fetchedRegion,
          country: fetchedCountry,
          continent: fetchedContinentFromResponse,
        } = response

        // Get continent from top-level response, or from country object
        const fetchedContinent =
          fetchedContinentFromResponse || fetchedCountry?.continent

        previousCoordsRef.current = { longitude, latitude }

        const targetCountryId = fetchedCountry?.id
          ? String(fetchedCountry.id)
          : ''
        const targetRegionId = fetchedRegion?.id ? String(fetchedRegion.id) : ''

        console.log('[LocationSelection] Extracted IDs:', {
          targetCountryId,
          targetRegionId,
          countryName: fetchedCountry?.name,
          regionName: fetchedRegion?.name,
        })

        if (fetchedCountry?.name) {
          setCountryName(fetchedCountry.name)
        }
        if (fetchedRegion?.name) {
          setRegionName(fetchedRegion.name)
        } else {
          setRegionName('')
        }

        clearedCountryRef.current = null

        // Get continent from the result (it's now included directly in the response)
        const continentSlug = fetchedContinent?.slug || ''

        if (fetchedRegion && fetchedCountry && targetCountryId) {
          // Always set continent if we have it (either it's different or currently empty)
          if (continentSlug && (!continent || continent !== continentSlug)) {
            pendingCountryIdRef.current = targetCountryId
            pendingRegionIdRef.current = targetRegionId
            onLocationChangeRef.current('continent', continentSlug)
          } else {
            // Continent is already set correctly, now set country and region
            onLocationChangeRef.current('country', targetCountryId)
            if (targetRegionId) {
              onLocationChangeRef.current('region', targetRegionId)
            }
          }
        } else if (fetchedCountry && targetCountryId) {
          if (region) {
            onLocationChangeRef.current('region', '')
          }

          const continentSlug = fetchedContinent?.slug || ''
          console.log(
            '[LocationSelection] Country found but no region. Continent slug:',
            continentSlug,
          )

          // Always set continent if we have it (either it's different or currently empty)
          if (continentSlug && (!continent || continent !== continentSlug)) {
            console.log(
              '[LocationSelection] Setting continent (country only):',
              continentSlug,
            )
            pendingCountryIdRef.current = targetCountryId
            onLocationChangeRef.current('continent', continentSlug)
          } else {
            console.log(
              '[LocationSelection] No continent slug or already set, setting country only',
            )
            onLocationChangeRef.current('country', targetCountryId)
          }

          setRegionNotFoundMessage(ERROR_DETERMINE_REGION)

          previousCoordsRef.current = { longitude, latitude }
        } else {
          setCountryName('')
          setRegionName('')
          if (region) {
            onLocationChangeRef.current('region', '')
          }
          if (country) {
            onLocationChangeRef.current('country', '')
          }

          setRegionNotFoundMessage(ERROR_DETERMINE_REGION)

          setIsDeterminingLocation(false)
          isAutoFillingRef.current = false

          previousCoordsRef.current = { longitude, latitude }
        }
      } catch (error) {
        console.error('Error fetching region from coordinates:', error)

        // Safely handle errors without crashing the app
        try {
          setCountryName('')
          setRegionName('')
          if (region) {
            onLocationChangeRef.current('region', '')
          }
          setRegionNotFoundMessage(
            'Error determining region. Please try entering manually.',
          )

          previousCoordsRef.current = { longitude, latitude }

          setIsDeterminingLocation(false)
          isAutoFillingRef.current = false
        } catch (innerError) {
          // If even error handling fails, just log it
          console.error('Error in error handler:', innerError)
        }
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [findOnMap, longitude, latitude, continent, country, region])

  const handleLocationUpdate = useCallback((coordinates: Coordinates) => {
    onLocationChangeRef.current('longitude', coordinates.longitude)
    onLocationChangeRef.current('latitude', coordinates.latitude)
  }, [])

  const handleUseMyLocation = useCallback(() => {
    if (navigator.geolocation) {
      // Use high accuracy options to prefer GPS over IP-based location
      // This helps avoid VPN interference on devices with GPS
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
          }

          // Log accuracy info for debugging
          console.log('Location obtained:', {
            coords,
            accuracy: position.coords.accuracy, // in meters
            source:
              position.coords.accuracy < 100
                ? 'GPS'
                : 'Network/IP (may be affected by VPN)',
          })

          setUserLocation(coords)
          onLocationChangeRef.current('longitude', coords.longitude)
          onLocationChangeRef.current('latitude', coords.latitude)

          if (mapRef.current) {
            mapRef.current.addPinToMap(coords)
          }
        },
        (error) => {
          console.error('Error getting location:', error)
          let errorMessage = 'Could not get your location. '

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage +=
                'Please allow location access in your browser settings.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage +=
                'Location information is unavailable. This may be affected by your VPN. Please enter manually or disable VPN.'
              break
            case error.TIMEOUT:
              errorMessage += 'Location request timed out. Please try again.'
              break
            default:
              errorMessage += 'Please enter manually.'
          }

          showError(errorMessage)
        },
        {
          enableHighAccuracy: true, // Prefer GPS over IP-based location
          timeout: 15000, // Increased timeout to allow GPS to get a fix
          maximumAge: 0, // Don't use cached location, always get fresh location
        },
      )
    } else {
      showError('Geolocation is not supported by your browser.')
    }
  }, [])

  // Check if current pin location matches user location (within ~200m tolerance)
  const isAtUserLocation = useCallback(() => {
    if (!userLocation || !longitude || !latitude) return false

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      latitude,
      longitude,
    )

    // Consider it a match if within 200 meters
    return distance < 0.2
  }, [userLocation, longitude, latitude])

  return {
    filteredCountries,
    filteredRegions,
    mapRef,
    isMapReady,
    setIsMapReady,
    isDeterminingLocation,
    regionNotFoundMessage,
    countryName,
    regionName,
    handleLocationUpdate,
    handleUseMyLocation,
    isAtUserLocation: isAtUserLocation(),
  } as const
}

export type LocationSelection = ReturnType<typeof useLocationSelection>
