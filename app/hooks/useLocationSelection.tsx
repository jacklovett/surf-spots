import { useState, useEffect, useRef, useCallback } from 'react'
import {
  getRegionAndCountryFromCoordinates,
  calculateDistance,
} from '~/services/mapService'
import { get } from '~/services/networkService'
import { Country, Region, Coordinates, SurfSpotFormState } from '~/types/surfSpots'
import type { AddSurfSpotMapRef } from '~/components/SurfMap/AddSurfSpotMap'

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
}: UseLocationSelectionProps) => {
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
        const { region: fetchedRegion, country: fetchedCountry } =
          await getRegionAndCountryFromCoordinates(longitude, latitude)

        previousCoordsRef.current = { longitude, latitude }

        const targetCountryId = fetchedCountry?.id
          ? String(fetchedCountry.id)
          : ''
        const targetRegionId = fetchedRegion?.id ? String(fetchedRegion.id) : ''

        if (fetchedCountry?.name) {
          setCountryName(fetchedCountry.name)
        }
        if (fetchedRegion?.name) {
          setRegionName(fetchedRegion.name)
        } else {
          setRegionName('')
        }

        clearedCountryRef.current = null

        if (fetchedRegion && fetchedCountry && targetCountryId) {
          const continentSlug = fetchedCountry.continent?.slug || ''

          if (continentSlug && continent !== continentSlug) {
            pendingCountryIdRef.current = targetCountryId
            pendingRegionIdRef.current = targetRegionId
            onLocationChangeRef.current('continent', continentSlug)
          } else {
            onLocationChangeRef.current('country', targetCountryId)
            if (targetRegionId) {
              onLocationChangeRef.current('region', targetRegionId)
            }
          }
        } else if (fetchedCountry && targetCountryId) {
          if (region) {
            onLocationChangeRef.current('region', '')
          }

          const continentSlug = fetchedCountry.continent?.slug || ''

          if (continentSlug && continent !== continentSlug) {
            pendingCountryIdRef.current = targetCountryId
            onLocationChangeRef.current('continent', continentSlug)
          } else {
            onLocationChangeRef.current('country', targetCountryId)
          }

          setRegionNotFoundMessage(
            'Unable to determine region for this location. Please try entering manually.',
          )

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

          setRegionNotFoundMessage(
            'Unable to determine region for this location. Please try entering manually.',
          )

          setIsDeterminingLocation(false)
          isAutoFillingRef.current = false

          previousCoordsRef.current = { longitude, latitude }
        }
      } catch (error) {
        console.error('Error fetching region from coordinates:', error)

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
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [findOnMap, longitude, latitude, continent, country, region])

  const handleLocationUpdate = useCallback(
    (coordinates: Coordinates) => {
      onLocationChangeRef.current('longitude', coordinates.longitude)
      onLocationChangeRef.current('latitude', coordinates.latitude)
    },
    [],
  )

  const handleUseMyLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
          }
          onLocationChangeRef.current('longitude', coords.longitude)
          onLocationChangeRef.current('latitude', coords.latitude)

          if (mapRef.current) {
            mapRef.current.addPinToMap(coords)
          }
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Could not get your location. Please enter manually.')
        },
      )
    } else {
      alert('Geolocation is not supported by your browser.')
    }
  }, [])

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
  } as const
}

export type LocationSelection = ReturnType<typeof useLocationSelection>

