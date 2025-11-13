import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigation, useLoaderData } from 'react-router'

import {
  getRegionAndCountryFromCoordinates,
  calculateDistance,
} from '~/services/mapService'
import { get } from '~/services/networkService'

import { useSettingsContext } from '~/contexts'
import { useSubmitStatus, useFormValidation } from '~/hooks'
import {
  validateRequired,
  validateLongitude,
  validateLatitude,
  validateDirection,
  validateUrl,
} from '~/hooks/useFormValidation'
import {
  Availability,
  BREAK_TYPE_OPTIONS,
  BEACH_BOTTOM_OPTIONS,
  SKILL_LEVEL_OPTIONS,
  TIDE_OPTIONS,
  WAVE_DIRECTION_OPTIONS,
  MONTH_LIST,
  PARKING_OPTIONS,
  ACCOMMODATION_TYPES,
  FOOD_OPTIONS,
  FACILITIES,
  HAZARDS,
} from '~/types/formData'
import {
  SurfSpotStatus,
  Country,
  Region,
  SurfSpotFormState,
  SurfSpotType,
  BeachBottomType,
  SkillLevel,
  Tide,
  WaveDirection,
  Coordinates,
} from '~/types/surfSpots'
import {
  directionStringToArray,
  directionArrayToString,
} from '~/utils/surfSpotUtils'
import { kmToMiles } from '~/utils'
import { determineInitialOptions, LoaderData } from './index'
import {
  AddSurfSpotMap,
  CheckboxOption,
  ChipSelector,
  DirectionSelector,
  ErrorBoundary,
  ForecastLinks,
  FormComponent,
  FormInput,
  InfoMessage,
  Page,
  Rating,
  ViewSwitch,
} from '~/components'
import { Option } from '~/components/FormInput'
import { ForecastLink } from '../ForecastLinks'
import type { AddSurfSpotMapRef } from '~/components/SurfMap/AddSurfSpotMap'

interface SurfSpotFormProps {
  actionType: 'Add' | 'Edit'
}

export const SurfSpotForm = (props: SurfSpotFormProps) => {
  const { actionType } = props
  const { state } = useNavigation()
  const loading = state === 'loading'

  const { continents, surfSpot } = useLoaderData<LoaderData>()

  const { settings } = useSettingsContext()
  const { preferredUnits } = settings

  const distanceUnits = preferredUnits === 'metric' ? 'km' : 'mi'
  const waveUnits = preferredUnits === 'metric' ? 'm' : 'ft'

  const submitStatus = useSubmitStatus()

  const [findOnMap, setFindOnMap] = useState(true)

  const [spotStatus, setSpotStatus] = useState(
    surfSpot?.status || SurfSpotStatus.PENDING,
  )

  const [isBoatRequired, setIsBoatRequired] = useState(!!surfSpot?.boatRequired)

  const [accommodation, setAccommodation] = useState<Availability>({
    nearby: !!surfSpot?.accommodationNearby,
    options: determineInitialOptions(
      ACCOMMODATION_TYPES,
      surfSpot?.accommodationTypes,
    ),
  })
  const [food, setFood] = useState<Availability>({
    nearby: !!surfSpot?.foodNearby,
    options: determineInitialOptions(FOOD_OPTIONS, surfSpot?.foodTypes),
  })
  const [facilities, setFacilities] = useState<Option[]>(
    determineInitialOptions(FACILITIES, surfSpot?.facilities),
  )
  const [hazards, setHazards] = useState<Option[]>(
    determineInitialOptions(HAZARDS, surfSpot?.hazards),
  )
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([])
  const [filteredRegions, setFilteredRegions] = useState<Region[]>([])
  const filteredCountriesRef = useRef<Country[]>([])
  const filteredRegionsRef = useRef<Region[]>([])
  const mapRef = useRef<AddSurfSpotMapRef | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const [isDeterminingLocation, setIsDeterminingLocation] = useState(false)
  const [regionNotFoundMessage, setRegionNotFoundMessage] = useState<
    string | null
  >(null)
  // Store country/region names for display in map mode (no dropdowns needed)
  const [countryName, setCountryName] = useState<string>('')
  const [regionName, setRegionName] = useState<string>('')
  // Track if we cleared the country so we know to set it even if formState hasn't updated yet
  const clearedCountryRef = useRef<string | null>(null)

  const isPrivateSpot = spotStatus === SurfSpotStatus.PRIVATE

  // Convert direction strings to arrays for DirectionSelector
  const initialSwellDirection = directionStringToArray(
    surfSpot?.swellDirection || '',
  )
  const initialWindDirection = directionStringToArray(
    surfSpot?.windDirection || '',
  )

  // Local state for direction arrays (used by DirectionSelector)
  const [swellDirectionArray, setSwellDirectionArray] = useState<string[]>(
    initialSwellDirection,
  )
  const [windDirectionArray, setWindDirectionArray] =
    useState<string[]>(initialWindDirection)

  const { formState, errors, isFormValid, handleChange } = useFormValidation({
    initialFormState: {
      continent: surfSpot?.continent?.slug || '',
      country: surfSpot?.country?.id || '',
      region: surfSpot?.region?.id || '',
      name: surfSpot?.name || '',
      type: surfSpot?.type || '',
      beachBottomType: surfSpot?.beachBottomType || '',
      description: surfSpot?.description || '',
      longitude: surfSpot?.longitude,
      latitude: surfSpot?.latitude,
      swellDirection: directionArrayToString(initialSwellDirection),
      windDirection: directionArrayToString(initialWindDirection),
      rating: surfSpot?.rating ?? '',
      tide: surfSpot?.tide || '',
      waveDirection: surfSpot?.waveDirection || '',
      minSurfHeight: surfSpot?.minSurfHeight ?? '',
      maxSurfHeight: surfSpot?.maxSurfHeight ?? '',
      seasonStart: surfSpot?.seasonStart || '',
      seasonEnd: surfSpot?.seasonEnd || '',
      parking: surfSpot?.parking || '',
      foodNearby: !!surfSpot?.foodNearby,
      skillLevel: surfSpot?.skillLevel || '',
      forecastLinks: (surfSpot?.forecasts as unknown as ForecastLink[]) || [],
    } as SurfSpotFormState,
    validationFunctions: {
      continent: validateRequired,
      country: validateRequired,
      region: validateRequired,
      longitude: validateLongitude,
      latitude: validateLatitude,
      name: validateRequired,
      description: validateRequired,
      swellDirection: (value) => validateDirection(value, 'Swell Direction'),
      windDirection: (value) => validateDirection(value, 'Wind Direction'),
      forecastLinks: (links) => {
        if (!Array.isArray(links)) return 'Invalid data format'

        // Validate each link and update its errorMessage
        const updatedLinks = links.map((link) => ({
          ...link,
          errorMessage: validateUrl(link.url, 'Forecast Link') || '', // Clear error if valid
        }))

        // Only update state if the validation errors have changed
        if (JSON.stringify(links) !== JSON.stringify(updatedLinks)) {
          handleChange('forecastLinks', updatedLinks)
        }

        return ''
      },
    },
  })

  // Handle location updates from the map
  const handleLocationUpdate = useCallback(
    (coordinates: Coordinates) => {
      handleChange('longitude', coordinates.longitude)
      handleChange('latitude', coordinates.latitude)
    },
    [handleChange],
  )

  const { continent, country } = formState

  // Track if we're auto-filling from coordinates to prevent clearing values
  const isAutoFillingRef = useRef(false)

  // Store pending country/region IDs to set after data loads
  const pendingCountryIdRef = useRef<string | null>(null)
  const pendingRegionIdRef = useRef<string | null>(null)

  // When editing, ensure countries and regions are fetched if we have continent/country from surfSpot
  // This ensures dropdowns show the correct values even in map mode
  useEffect(() => {
    const continentSlug = surfSpot?.continent?.slug
    const countryId = surfSpot?.country?.id

    if (continentSlug) {
      // Fetch countries for the continent when editing
      const fetchInitialCountries = async () => {
        try {
          const countries = await get<Country[]>(
            `countries/continent/${continentSlug}`,
          )
          setFilteredCountries(countries)
          filteredCountriesRef.current = countries

          // If we have a country, fetch regions too
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
  }, [surfSpot?.continent?.slug, surfSpot?.country?.id])

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

          // If we have a pending country ID, set it immediately
          if (pendingCountryIdRef.current) {
            handleChange('country', pendingCountryIdRef.current)
            pendingCountryIdRef.current = null
            // Determining state will be cleared by the useEffect that watches both values
          }
        } catch (error) {
          console.error('Error fetching countries:', error)
          // Only clear if we're auto-filling and hit an error
          if (isAutoFillingRef.current) {
            setIsDeterminingLocation(false)
            isAutoFillingRef.current = false
          }
        }
      } else {
        // Clear countries if no continent is selected (only in manual mode)
        // In map mode, location lookup manages country/region state
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

          // If we have a pending region ID, set it
          if (pendingRegionIdRef.current) {
            handleChange('region', pendingRegionIdRef.current)
            pendingRegionIdRef.current = null
            // Determining state will be cleared by the useEffect that watches both values
          }
          // Determining state will be cleared by the useEffect that watches both values
        } catch (error) {
          console.error('Error fetching regions:', error)
          // Only clear if we're auto-filling - means we're done processing
          if (isAutoFillingRef.current) {
            setIsDeterminingLocation(false)
            isAutoFillingRef.current = false
          }
        }
      } else {
        // Clear regions if no country is selected
        // Only clear determining state if we're not auto-filling (manual mode)
        setFilteredRegions([])
        if (!isAutoFillingRef.current) {
          setIsDeterminingLocation(false)
        }
      }
    }

    fetchRegions()
  }, [country])

  // Clear determining state ONLY when BOTH country and region are set (or we've confirmed we can't get them)
  // This ensures we don't clear prematurely when one loads before the other
  useEffect(() => {
    // Only process if we're auto-filling and determining location
    if (!isAutoFillingRef.current || !isDeterminingLocation) {
      return
    }

    // Don't clear if we're still waiting for pending values to be set
    const stillWaiting =
      pendingCountryIdRef.current || pendingRegionIdRef.current
    if (stillWaiting) {
      return
    }

    // Case 1: Both country and region are set - we're done!
    const bothSet = formState.country && formState.region
    if (bothSet) {
      setIsDeterminingLocation(false)
      isAutoFillingRef.current = false
      return
    }

    // Case 2: Country is set but no region - only clear if we've confirmed there's no region
    // (regionNotFoundMessage is set OR regions list has loaded and is empty)
    const countrySetNoRegion =
      formState.country &&
      !formState.region &&
      (regionNotFoundMessage ||
        (filteredRegionsRef.current.length === 0 &&
          country &&
          !pendingRegionIdRef.current))
    if (countrySetNoRegion) {
      setIsDeterminingLocation(false)
      isAutoFillingRef.current = false
    }
  }, [
    formState.country,
    formState.region,
    isDeterminingLocation,
    regionNotFoundMessage,
    country,
  ])

  const { longitude, latitude } = formState
  const previousCoordsRef = useRef<{
    longitude: number
    latitude: number
  } | null>(null)

  // When using map pin, get country and region from coordinates (with debouncing)
  useEffect(() => {
    if (!findOnMap || !longitude || !latitude) {
      setIsDeterminingLocation(false)
      return
    }

    // Check if pin has moved significantly
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

    // Set auto-filling flag immediately when coordinates change
    // This prevents the useEffect from clearing determining state prematurely
    isAutoFillingRef.current = true

    // Clear any pending refs when coordinates change - we're starting a new lookup
    // This ensures the useEffect doesn't think we're still waiting for old pending values
    pendingCountryIdRef.current = null
    pendingRegionIdRef.current = null

    // Clear country/region names when starting a new lookup
    setCountryName('')
    setRegionName('')

    // Clear any previous error messages when starting a new lookup
    setRegionNotFoundMessage(null)

    // Set determining states immediately when coordinates change
    setIsDeterminingLocation(true)

    // Always clear region/country when coordinates change to prevent
    // the useEffect from seeing old values and clearing determining state prematurely
    // Only clear if we have previous coordinates (not initial load) and coordinates changed
    if (previousCoordsRef.current && distance > 0) {
      // Clear region if pin has moved >30km to show "Determining region..." immediately
      if (hasMovedForRegion && formState.region) {
        handleChange('region', '')
      }

      // Clear country if pin has moved >50km to show "Determining Country..." immediately
      if (hasMovedForCountry && formState.country) {
        clearedCountryRef.current = formState.country
        handleChange('country', '')
      } else if (formState.country) {
        // If coordinates changed but <50km, still clear country to ensure fresh lookup
        // This handles the case where pin moved to different country but <50km
        clearedCountryRef.current = formState.country
        handleChange('country', '')
        // Also clear region since country changed
        if (formState.region) {
          handleChange('region', '')
        }
      }
    }

    // Debounce the API call to avoid spamming when user drags the pin
    const debounceTimer = setTimeout(async () => {
      try {
        const { region, country } = await getRegionAndCountryFromCoordinates(
          longitude,
          latitude,
        )

        // Update previous coordinates after api call completes successfully
        // This ensures the distance check works correctly on subsequent moves
        previousCoordsRef.current = { longitude, latitude }

        // Use country from API response (prefer Mapbox country, fallback to region.country)
        const targetCountryId = country?.id ? String(country.id) : ''
        const targetRegionId = region?.id ? String(region.id) : ''

        // Store names for display in map mode
        if (country?.name) {
          setCountryName(country.name)
        }
        if (region?.name) {
          setRegionName(region.name)
        } else {
          setRegionName('')
        }

        // Clear the cleared country flag
        clearedCountryRef.current = null

        // If we have a region, set both region and country
        if (region && country && targetCountryId) {
          const continentSlug = country.continent?.slug || ''

          // Update continent if needed
          if (continentSlug && formState.continent !== continentSlug) {
            // Set continent first, then set country and region immediately
            pendingCountryIdRef.current = targetCountryId
            pendingRegionIdRef.current = targetRegionId
            handleChange('continent', continentSlug)
            // Country and region will be set by useEffects, but we'll clear determining state there
          } else {
            // Continent matches or no continent - set country and region immediately
            handleChange('country', targetCountryId)
            if (targetRegionId) {
              handleChange('region', targetRegionId)
            }
            // Determining state will be cleared by the useEffect that watches both values
          }
        } else if (country && targetCountryId) {
          // No region found, but we have country - set country and show message
          if (formState.region) {
            handleChange('region', '')
          }

          const continentSlug = country.continent?.slug || ''

          // Update continent if needed
          if (continentSlug && formState.continent !== continentSlug) {
            // Set continent first, then set country
            pendingCountryIdRef.current = targetCountryId
            handleChange('continent', continentSlug)
            // Country will be set by countries useEffect
            // Regions useEffect will clear determining state after confirming no region
          } else {
            // Continent matches or no continent - set country directly
            handleChange('country', targetCountryId)
            // Don't clear determining state here - let regions useEffect handle it
            // It will clear after confirming there's no region
          }

          // Show message that region needs to be selected manually
          setRegionNotFoundMessage(
            'Unable to determine region for this location. Please try entering manually.',
          )

          previousCoordsRef.current = { longitude, latitude }
        } else {
          // No region and no country found
          setCountryName('')
          setRegionName('')
          if (formState.region) {
            handleChange('region', '')
          }
          if (formState.country) {
            handleChange('country', '')
          }

          setRegionNotFoundMessage(
            'Unable to determine region for this location. Please try entering manually.',
          )

          // Clear determining state immediately
          setIsDeterminingLocation(false)
          isAutoFillingRef.current = false

          previousCoordsRef.current = { longitude, latitude }
        }
      } catch (error) {
        console.error('Error fetching region from coordinates:', error)

        setCountryName('')
        setRegionName('')
        if (formState.region) {
          handleChange('region', '')
        }
        setRegionNotFoundMessage(
          'Error determining region. Please try entering manually.',
        )

        // Update previous coordinates even on error
        // This ensures the 50km check works correctly on subsequent moves
        previousCoordsRef.current = { longitude, latitude }

        // Clear determining states on error immediately
        setIsDeterminingLocation(false)
        isAutoFillingRef.current = false
      }
      // Don't clear in finally - let the regions useEffect handle it when region is set
    }, 500) // 500ms debounce - wait for user to stop moving pin

    return () => clearTimeout(debounceTimer)
  }, [findOnMap, longitude, latitude])

  return (
    <Page showHeader>
      <div className="info-page-content mv map-content">
        <h1>{`${actionType} Surf Spot`}</h1>
        <InfoMessage message="Public surf spots are reviewed and, if approved, become visible to everyone." />
        <FormComponent
          loading={loading}
          isDisabled={!isFormValid}
          submitStatus={submitStatus}
          method={actionType === 'Edit' ? 'patch' : 'post'}
        >
          <CheckboxOption
            name="isPrivate"
            title="Keep Private"
            description="Only you will be able to see this spot. Your secret is safe with us!"
            checked={isPrivateSpot}
            onChange={() =>
              setSpotStatus(
                isPrivateSpot ? SurfSpotStatus.PENDING : SurfSpotStatus.PRIVATE,
              )
            }
          />
          <FormInput
            field={{
              label: 'Name',
              name: 'name',
              type: 'text',
            }}
            value={formState.name}
            onChange={(e) => handleChange('name', e.target.value)}
            errorMessage={errors.name || ''}
            showLabel={!!formState.name}
          />
          <FormInput
            field={{
              label: 'Description',
              name: 'description',
              type: 'textarea',
            }}
            onChange={(e) => handleChange('description', e.target.value)}
            value={formState.description}
            errorMessage={errors.description || ''}
            showLabel={!!formState.description}
          />
          <h3 className="mv pt">Set Location</h3>
          <div className="mb row space-between">
            <ViewSwitch
              isPrimaryView={findOnMap}
              onToggleView={() => setFindOnMap(!findOnMap)}
              primaryLabel="Use Map"
              secondaryLabel="Enter Manually"
            />
          </div>
          {findOnMap && (
            <div className="find-spot-map">
              <ErrorBoundary message="Uh-oh! Something went wrong displaying the map!">
                <AddSurfSpotMap
                  onLocationUpdate={handleLocationUpdate}
                  initialCoordinates={
                    formState.longitude && formState.latitude
                      ? {
                          longitude: formState.longitude,
                          latitude: formState.latitude,
                        }
                      : undefined
                  }
                  onMapReady={() => setIsMapReady(true)}
                  ref={mapRef}
                />
              </ErrorBoundary>
            </div>
          )}
          {!findOnMap && (
            <FormInput
              field={{
                label: 'Continent',
                name: 'continent',
                type: 'select',
                options: [
                  { key: '', value: '', label: 'Select a continent' },
                  ...continents.map((c) => ({
                    key: c.slug,
                    value: c.slug,
                    label: c.name,
                  })),
                ],
              }}
              value={formState.continent}
              onChange={(e) => handleChange('continent', e.target.value)}
              errorMessage={errors.continent || ''}
              showLabel={!!formState.continent}
            />
          )}
          <div className="form-inline">
            {findOnMap ? (
              <>
                <FormInput
                  field={{
                    label: 'Country',
                    name: 'country',
                    type: 'text',
                  }}
                  value={
                    isDeterminingLocation
                      ? 'Determining country...'
                      : countryName || ''
                  }
                  onChange={() => {}} // Read-only in map mode
                  errorMessage={!isDeterminingLocation ? errors.country : ''}
                  showLabel={!!countryName}
                  disabled={true}
                  readOnly={true}
                />
                <FormInput
                  field={{
                    label: 'Region',
                    name: 'region',
                    type: 'text',
                  }}
                  value={
                    isDeterminingLocation
                      ? 'Determining region...'
                      : regionName || ''
                  }
                  onChange={() => {}} // Read-only in map mode
                  errorMessage={!isDeterminingLocation ? errors.region : ''}
                  showLabel={!!regionName}
                  disabled={true}
                  readOnly={true}
                />
              </>
            ) : (
              <>
                <FormInput
                  field={{
                    label: 'Country',
                    name: 'country',
                    type: 'select',
                    options: [
                      {
                        key: '',
                        value: '',
                        label: 'Select a country',
                      },
                      ...filteredCountries.map((c) => ({
                        key: c.id,
                        value: c.id,
                        label: c.name,
                      })),
                    ],
                  }}
                  value={formState.country || ''}
                  onChange={(e) => handleChange('country', e.target.value)}
                  errorMessage={errors.country || ''}
                  showLabel={!!formState.country}
                  disabled={!continent}
                />
                <FormInput
                  field={{
                    label: 'Region',
                    name: 'region',
                    type: 'select',
                    options: [
                      {
                        key: '',
                        value: '',
                        label: 'Select a region',
                      },
                      ...filteredRegions.map((r) => ({
                        key: r.id,
                        value: r.id,
                        label: r.name,
                      })),
                    ],
                  }}
                  value={formState.region || ''}
                  onChange={(e) => handleChange('region', e.target.value)}
                  errorMessage={errors.region || ''}
                  showLabel={!!formState.region}
                  disabled={!country}
                />
              </>
            )}
          </div>
          {/* Hidden inputs to ensure region, longitude, and latitude are always included in form submission */}
          <input type="hidden" name="region" value={formState.region || ''} />
          {/* Include longitude/latitude as hidden inputs when visible inputs are disabled */}
          {findOnMap && formState.longitude !== undefined && (
            <input type="hidden" name="longitude" value={formState.longitude} />
          )}
          {findOnMap && formState.latitude !== undefined && (
            <input type="hidden" name="latitude" value={formState.latitude} />
          )}
          {regionNotFoundMessage && findOnMap && !formState.region && (
            <InfoMessage message={regionNotFoundMessage} />
          )}
          <div className="form-inline">
            <FormInput
              field={{
                label: 'Longitude',
                name: 'longitude',
                type: 'number',
              }}
              value={formState.longitude}
              onChange={(e) =>
                handleChange('longitude', parseFloat(e.target.value))
              }
              errorMessage={errors.longitude || ''}
              showLabel={!!formState.longitude}
              disabled={findOnMap}
              readOnly={findOnMap}
            />
            <FormInput
              field={{
                label: 'Latitude',
                name: 'latitude',
                type: 'number',
              }}
              value={formState.latitude}
              onChange={(e) =>
                handleChange('latitude', parseFloat(e.target.value))
              }
              errorMessage={errors.latitude || ''}
              showLabel={!!formState.latitude}
              disabled={findOnMap}
              readOnly={findOnMap}
            />
          </div>
          <h3 className="mt pt">Tell us about the spot</h3>
          <div className="form-inline">
            <FormInput
              field={{
                label: 'Break Type',
                name: 'type',
                type: 'select',
                options: BREAK_TYPE_OPTIONS,
              }}
              onChange={(e) =>
                handleChange('type', e.target.value as SurfSpotType)
              }
              errorMessage={errors.type || ''}
              value={formState.type}
              showLabel
            />
            <FormInput
              field={{
                label: 'Beach Bottom Type',
                name: 'beachBottomType',
                type: 'select',
                options: BEACH_BOTTOM_OPTIONS,
              }}
              onChange={(e) =>
                handleChange(
                  'beachBottomType',
                  e.target.value as BeachBottomType,
                )
              }
              errorMessage={errors.beachBottomType || ''}
              value={formState.beachBottomType}
              showLabel
            />
          </div>
          <FormInput
            field={{
              label: 'Skill Level',
              name: 'skillLevel',
              type: 'select',
              options: SKILL_LEVEL_OPTIONS,
            }}
            onChange={(e) =>
              handleChange('skillLevel', e.target.value as SkillLevel)
            }
            errorMessage={errors.skillLevel || ''}
            value={formState.skillLevel}
            showLabel
          />
          <FormInput
            field={{
              label: 'Wave Direction',
              name: 'waveDirection',
              type: 'select',
              options: WAVE_DIRECTION_OPTIONS,
            }}
            onChange={(e) =>
              handleChange('waveDirection', e.target.value as WaveDirection)
            }
            errorMessage={errors.waveDirection || ''}
            value={formState.waveDirection}
            showLabel
          />

          <div className="pv">
            <h4 className="m-0 pt">Best Conditions</h4>
            <div className="form-inline">
              <div className="direction-selector-wrapper">
                <label className="form-label">Swell Direction</label>
                <p className="direction-selector-help">
                  Click a direction, then click another to select a range
                </p>
                <DirectionSelector
                  selected={swellDirectionArray}
                  onChange={(directions) => {
                    setSwellDirectionArray(directions)
                    handleChange(
                      'swellDirection',
                      directionArrayToString(directions),
                    )
                  }}
                  formName="swellDirection"
                />
                {errors.swellDirection && (
                  <p className="form-error">{errors.swellDirection}</p>
                )}
              </div>
              <div className="direction-selector-wrapper">
                <label className="form-label">Wind Direction</label>
                <p className="direction-selector-help">
                  Click a direction, then click another to select a range
                </p>
                <DirectionSelector
                  selected={windDirectionArray}
                  onChange={(directions) => {
                    setWindDirectionArray(directions)
                    handleChange(
                      'windDirection',
                      directionArrayToString(directions),
                    )
                  }}
                  formName="windDirection"
                />
                {errors.windDirection && (
                  <p className="form-error">{errors.windDirection}</p>
                )}
              </div>
            </div>
            <FormInput
              field={{
                label: 'Tide',
                name: 'tide',
                type: 'select',
                options: TIDE_OPTIONS,
              }}
              onChange={(e) => handleChange('tide', e.target.value as Tide)}
              errorMessage={errors.tide || ''}
              value={formState.tide}
              showLabel
            />
            <div className="mv">
              <p className="m-0 pt bold">Ideal Surf Height</p>
              <div className="form-inline">
                <FormInput
                  field={{
                    label: `Min Surf Height (${waveUnits})`,
                    name: 'minSurfHeight',
                    type: 'number',
                  }}
                  value={formState.minSurfHeight}
                  onChange={(e) => {
                    const value = e.target.value
                    handleChange(
                      'minSurfHeight',
                      value === '' ? undefined : parseFloat(value),
                    )
                  }}
                  errorMessage={errors.minSurfHeight || ''}
                  showLabel={!!formState.minSurfHeight}
                />
                <FormInput
                  field={{
                    label: `Max Surf Height (${waveUnits})`,
                    name: 'maxSurfHeight',
                    type: 'number',
                  }}
                  value={formState.maxSurfHeight}
                  onChange={(e) => {
                    const value = e.target.value
                    handleChange(
                      'maxSurfHeight',
                      value === '' ? undefined : parseFloat(value),
                    )
                  }}
                  errorMessage={errors.maxSurfHeight || ''}
                  showLabel={!!formState.maxSurfHeight}
                />
              </div>
            </div>
            <p className="m-0 pt bold">When is the best time to go?</p>
            <div className="form-inline">
              <FormInput
                field={{
                  label: 'Season Starts',
                  name: 'seasonStart',
                  type: 'select',
                  options: MONTH_LIST,
                }}
                onChange={(e) => handleChange('seasonStart', e.target.value)}
                errorMessage={errors.seasonStart || ''}
                value={formState.seasonStart}
                showLabel
              />
              <FormInput
                field={{
                  label: 'Season Ends',
                  name: 'seasonEnd',
                  type: 'select',
                  options: MONTH_LIST,
                }}
                onChange={(e) => handleChange('seasonEnd', e.target.value)}
                errorMessage={errors.seasonEnd || ''}
                value={formState.seasonEnd}
                showLabel
              />
            </div>
          </div>
          <h4 className="mt pt">Access & Amenities</h4>
          {/* Access */}
          <div className="pv">
            <CheckboxOption
              name="boatRequired"
              title="Boat Required?"
              description="Is a boat required to access this surf spot?"
              checked={isBoatRequired}
              onChange={() => setIsBoatRequired(!isBoatRequired)}
            />
            {/* Parking */}
            {!isBoatRequired && (
              <FormInput
                field={{
                  label: 'Parking',
                  name: 'parking',
                  type: 'select',
                  options: PARKING_OPTIONS,
                }}
                value={formState.parking}
                onChange={(e) => handleChange('parking', e.target.value)}
                errorMessage={errors.parking || ''}
                showLabel
              />
            )}
          </div>
          {/* Forecast Links */}
          <div className="pv">
            <h4 className="m-0 pt">Forecast Links</h4>
            <p className="mb">
              Add forecast sites you know for this surf spot. (Maximum of 3)
            </p>
            <ForecastLinks
              forecastLinks={formState.forecastLinks}
              onChange={(links) => handleChange('forecastLinks', links)}
            />
          </div>
          {/* Amenities */}
          {/* Accommodation Nearby */}
          <div className="pv">
            <CheckboxOption
              name="accommodationNearby"
              title="Accommodation Nearby?"
              description={`Is there bookable accommodation available within ~${
                distanceUnits === 'mi' ? Math.round(kmToMiles(10)) : 10
              }${distanceUnits}?`}
              checked={accommodation.nearby}
              onChange={() =>
                setAccommodation({
                  ...accommodation,
                  nearby: !accommodation.nearby,
                })
              }
            />
            {accommodation.nearby && (
              <div className="mt">
                <ChipSelector
                  name="accommodationOptions"
                  options={ACCOMMODATION_TYPES}
                  selected={accommodation.options}
                  onChange={(selected) =>
                    setAccommodation({ ...accommodation, options: selected })
                  }
                />
              </div>
            )}
          </div>
          {/* Food Nearby */}
          <div className="pv">
            <CheckboxOption
              name="foodNearby"
              title="Food Nearby?"
              description="Is food available nearby?"
              checked={food.nearby}
              onChange={() =>
                setFood({
                  ...food,
                  nearby: !food.nearby,
                })
              }
            />
            {food.nearby && (
              <div className="mt">
                <ChipSelector
                  name="foodOptions"
                  options={FOOD_OPTIONS}
                  selected={food.options}
                  onChange={(selected) =>
                    setFood({
                      ...food,
                      options: selected,
                    })
                  }
                />
              </div>
            )}
          </div>
          {/* Facilities */}
          <div className="pv">
            <p className="bold pb">Facilities</p>
            <ChipSelector
              name="facilities"
              options={FACILITIES}
              selected={facilities}
              onChange={(selected) => setFacilities(selected)}
            />
          </div>
          {/* Hazards */}
          <div className="pv">
            <p className="bold pb">Hazards</p>
            <ChipSelector
              name="hazards"
              options={HAZARDS}
              selected={hazards}
              onChange={(selected) => setHazards(selected)}
            />
          </div>
          <h4 className="mv">How would you rate this spot?</h4>
          <div className="rating-container">
            <Rating
              value={formState.rating}
              onChange={(value) => handleChange('rating', value)}
            />
            <p className="rating-description">
              Rate this spot based on wave quality, amenities, safety, and
              overall vibe. Focus on the spot itself, not just a single session.
            </p>
          </div>
        </FormComponent>
      </div>
    </Page>
  )
}
