import { useState, useEffect } from 'react'
import {
  ActionFunction,
  data,
  LoaderFunction,
  useLoaderData,
  useNavigation,
} from 'react-router'

import { requireSessionCookie } from '~/services/session.server'
import {
  BeachBottomType,
  Continent,
  Country,
  Region,
  SurfSpotStatus,
  SurfSpotType,
  Tide,
  SkillLevel,
  SurfSpotFormState,
} from '~/types/surfSpots'

import {
  CheckboxOption,
  ChipSelector,
  ErrorBoundary,
  FormComponent,
  FormInput,
  ForecastLinks,
  InfoMessage,
  Page,
  Rating,
  SurfMap,
  TextButton,
  ViewSwitch,
} from '~/components'
import { Option } from '~/components/FormInput'
import { useFormValidation, useSubmitStatus } from '~/hooks'
import {
  validateDirection,
  validateLatitude,
  validateLongitude,
  validateRequired,
  validateUrl,
} from '~/hooks/useFormValidation'
import { useSettings } from '~/contexts'
import {
  ACCOMMODATION_TYPES,
  FOOD_OPTIONS,
  Availability,
  HAZARDS,
  MONTH_LIST,
  FACILITIES,
  PARKING_OPTIONS,
  TIDE_OPTIONS,
  SKILL_LEVEL_OPTIONS,
  BEACH_BOTTOM_OPTIONS,
  BREAK_TYPE_OPTIONS,
} from '~/types/formData'
import { kmToMiles } from '~/utils'
import { cacheControlHeader, get, post } from '~/services/networkService'
import { getRegionFromLocationData } from '~/services/mapService'

interface LoaderData {
  continents: Continent[]
  error: string
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireSessionCookie(request)

  try {
    const continents = await get<Continent[]>('continents')
    return data(
      { continents },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    console.error('Error fetching continents:', error)
    return data<LoaderData>(
      {
        continents: [],
        error: `We're having trouble finding continents data right now. Please try again later.`,
      },
      {
        status: 500,
      },
    )
  }
}

export const action: ActionFunction = async ({ request }) => {
  const user = await requireSessionCookie(request)
  const userId = user.id

  const formData = await request.formData()

  // Handle boolean fields
  const isPrivate = formData.get('isPrivate') === 'on'
  const foodNearby = formData.get('foodNearby') === 'on'
  const accommodationNearby = formData.get('accommodationNearby') === 'on'
  const boatRequired = formData.get('boatRequired') === 'on'

  // Handle array fields
  const foodOptions = formData.getAll('foodOptions') as string[]
  const accommodationOptions = formData.getAll(
    'accommodationOptions',
  ) as string[]
  const forecasts = formData.getAll('forecasts') as string[]
  const facilities = formData.getAll('facilities') as string[]
  const hazards = formData.getAll('hazards') as string[]
  // Handle other fields
  const name = formData.get('name')?.toString() || ''
  const description = formData.get('description')?.toString() || ''
  const regionId = formData.get('region')?.toString() || ''
  const longitude = parseFloat(formData.get('longitude')?.toString() || '0')
  const latitude = parseFloat(formData.get('latitude')?.toString() || '0')
  const type = formData.get('type')?.toString() || ''
  const beachBottomType = formData.get('beachBottomType')?.toString() || ''
  const swellDirection = formData.get('swellDirection')?.toString() || ''
  const windDirection = formData.get('windDirection')?.toString() || ''
  const tide = formData.get('tide')?.toString() || ''

  const minSurfHeightFormValue = formData.get('minSurfHeight')?.toString()
  const minSurfHeight = minSurfHeightFormValue
    ? parseFloat(minSurfHeightFormValue)
    : undefined
  const maxSurfHeightFormValue = formData.get('maxSurfHeight')?.toString()
  const maxSurfHeight = maxSurfHeightFormValue
    ? parseFloat(maxSurfHeightFormValue)
    : undefined

  const seasonStart = formData.get('seasonStart')?.toString() || ''
  const seasonEnd = formData.get('seasonEnd')?.toString() || ''
  const skillLevel = formData.get('skillLevel')?.toString() || ''

  const ratingFormValue = formData.get('rating')?.toString()
  const rating = ratingFormValue ? parseFloat(ratingFormValue) : undefined

  const parking = formData.get('parking')?.toString() || ''

  // Construct the new surf spot object
  const newSurfSpot = {
    name,
    description,
    regionId,
    longitude,
    latitude,
    type,
    beachBottomType,
    swellDirection,
    windDirection,
    tide,
    minSurfHeight,
    maxSurfHeight,
    seasonStart,
    seasonEnd,
    skillLevel,
    forecasts,
    boatRequired,
    parking,
    foodNearby,
    foodOptions,
    accommodationNearby,
    accommodationOptions,
    facilities,
    hazards,
    rating,
    status: isPrivate ? SurfSpotStatus.PRIVATE : SurfSpotStatus.PENDING,
    userId,
  }

  try {
    // Send the new surf spot to the backend
    await post('surf-spots', newSurfSpot)

    return data(
      { submitStatus: 'Surf spot added successfully', hasError: false },
      { status: 200 },
    )
  } catch (error) {
    console.error('Unable to add surf spot: ', error)
    return data(
      {
        submitStatus: 'Unable to add surf spot. Please try again later.',
        hasError: true,
      },
      { status: 500 },
    )
  }
}

export default function AddSurfSpot() {
  const { state } = useNavigation()
  const loading = state === 'loading'
  const { continents } = useLoaderData<LoaderData>()
  const { settings } = useSettings()
  const { preferredUnits } = settings

  const distanceUnits = preferredUnits === 'metric' ? 'km' : 'mi'
  const waveUnits = preferredUnits === 'metric' ? 'm' : 'ft'

  const submitStatus = useSubmitStatus()

  const [findOnMap, setFindOnMap] = useState(true)

  const [spotStatus, setSpotStatus] = useState(SurfSpotStatus.PENDING)
  const [isBoatRequired, setIsBoatRequired] = useState(false)
  const [accommodation, setAccommodation] = useState<Availability>({
    nearby: false,
    options: [],
  })
  const [food, setFood] = useState<Availability>({
    nearby: false,
    options: [],
  })
  const [facilities, setFacilities] = useState<Option[]>([])
  const [hazards, setHazards] = useState<Option[]>([])
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([])
  const [filteredRegions, setFilteredRegions] = useState<Region[]>([])

  const isPrivateSpot = spotStatus === SurfSpotStatus.PRIVATE

  const { formState, errors, isFormValid, handleChange } = useFormValidation({
    initialFormState: {
      continent: '',
      country: '',
      region: '',
      name: '',
      type: undefined,
      beachBottomType: undefined,
      description: '',
      longitude: undefined,
      latitude: undefined,
      swellDirection: '',
      windDirection: '',
      rating: undefined,
      tide: undefined,
      minSurfHeight: undefined,
      maxSurfHeight: undefined,
      seasonStart: '',
      seasonEnd: '',
      parking: '',
      foodNearby: false,
      skillLevel: undefined,
      forecastLinks: [],
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

  const { continent, country } = formState

  // Fetch countries when continent changes
  useEffect(() => {
    const fetchCountries = async () => {
      if (continent) {
        try {
          const countries = await get<Country[]>(
            `countries/continent/${continent}`,
          )
          setFilteredCountries(countries)
          // Reset country and region
          handleChange('country', '')
          handleChange('region', '')
          // Clear regions
          setFilteredRegions([])
        } catch (error) {
          console.error('Error fetching countries:', error)
        }
      } else {
        // Clear countries if no continent is selected
        setFilteredCountries([])
        setFilteredRegions([])
      }
    }

    fetchCountries()
  }, [continent])

  // Fetch regions when country changes
  useEffect(() => {
    const fetchRegions = async () => {
      if (country) {
        try {
          const regions = await get<Region[]>(`regions/country/${country}`)
          setFilteredRegions(regions)
          // Reset region
          handleChange('region', '')
        } catch (error) {
          console.error('Error fetching regions:', error)
        }
      } else {
        // Clear regions if no country is selected
        setFilteredRegions([])
      }
    }

    fetchRegions()
  }, [country])

  const { longitude, latitude } = formState

  useEffect(() => {
    const updateRegion = async () => {
      if (findOnMap && country && longitude && latitude) {
        const region = await getRegionFromLocationData(
          country,
          longitude,
          latitude,
        )
        handleChange('region', region?.name || '')
      }
    }

    updateRegion()
  }, [findOnMap, country, longitude, latitude])

  return (
    <Page showHeader>
      <div className="column center-vertical mv">
        <div className="page-content">
          <h1 className="mt">Add Surf Spot</h1>
          <InfoMessage message="Public surf spots are reviewed and, if approved, become visible to everyone." />
          <FormComponent
            loading={loading}
            isDisabled={!isFormValid}
            submitStatus={submitStatus}
          >
            <CheckboxOption
              name="isPrivate"
              title="Keep Private"
              description="Only you will be able to see this spot. Your secret is safe with us!"
              checked={isPrivateSpot}
              onChange={() =>
                setSpotStatus(
                  isPrivateSpot
                    ? SurfSpotStatus.PENDING
                    : SurfSpotStatus.PRIVATE,
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
              {findOnMap && (
                <div className="find-by-location">
                  <TextButton
                    text="Use my location"
                    onClick={() => console.log('/add-surf-spot')}
                    iconKey="crosshair"
                    filled
                  />
                </div>
              )}
            </div>
            {findOnMap && (
              <div className="find-spot-map">
                <ErrorBoundary message="Uh-oh! Something went wrong displaying the map!">
                  <SurfMap />
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
              <FormInput
                field={{
                  label: 'Country',
                  name: 'country',
                  type: 'select',
                  options: [
                    {
                      key: '',
                      value: '',
                      label: findOnMap ? 'Country' : 'Select a country',
                    },
                    ...filteredCountries.map((c) => ({
                      key: c.id,
                      value: c.id,
                      label: c.name,
                    })),
                  ],
                }}
                value={formState.country}
                onChange={(e) => handleChange('country', e.target.value)}
                errorMessage={errors.country || ''}
                showLabel={!!formState.country}
                disabled={!continent || findOnMap}
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
                      label: findOnMap ? 'Region' : 'Select a region',
                    },
                    ...filteredRegions.map((r) => ({
                      key: r.id,
                      value: r.id,
                      label: r.name,
                    })),
                  ],
                }}
                value={formState.region}
                onChange={(e) => handleChange('region', e.target.value)}
                errorMessage={errors.region || ''}
                showLabel={!!formState.region}
                disabled={!country || findOnMap}
              />
            </div>
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

            <div className="pv">
              <h4 className="m-0 pt">Best Conditions</h4>
              <div className="form-inline">
                <FormInput
                  field={{
                    label: 'Swell Direction',
                    name: 'swellDirection',
                    type: 'text',
                  }}
                  value={formState.swellDirection}
                  onChange={(e) =>
                    handleChange('swellDirection', e.target.value)
                  }
                  errorMessage={errors.swellDirection || ''}
                  showLabel={!!formState.swellDirection}
                />
                <FormInput
                  field={{
                    label: 'Wind Direction',
                    name: 'windDirection',
                    type: 'text',
                  }}
                  value={formState.windDirection}
                  onChange={(e) =>
                    handleChange('windDirection', e.target.value)
                  }
                  errorMessage={errors.windDirection || ''}
                  showLabel={!!formState.windDirection}
                />
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
                    onChange={(e) =>
                      handleChange('minSurfHeight', parseFloat(e.target.value))
                    }
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
                    onChange={(e) =>
                      handleChange('maxSurfHeight', parseFloat(e.target.value))
                    }
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
                  distanceUnits === 'mi' ? kmToMiles(10) : 10
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
                overall vibe. Focus on the spot itself, not just a single
                session.
              </p>
            </div>
          </FormComponent>
        </div>
      </div>
    </Page>
  )
}
