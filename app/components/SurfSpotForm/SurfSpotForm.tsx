import { useState, useEffect } from 'react'
import { useNavigation, useLoaderData } from 'react-router'

import { useSettingsContext } from '~/contexts'
import { defaultMapCenter } from '~/services/mapService'
import { Coordinates } from '~/types/surfSpots'
import {
  useSubmitStatus,
  useFormValidation,
  useLocationSelection,
} from '~/hooks'
import {
  validateRequired,
  validateLongitude,
  validateLatitude,
  validateDirection,
  validateUrl,
} from '~/hooks/useFormValidation'
import { SurfSpotStatus, SurfSpotFormState } from '~/types/surfSpots'
import {
  directionStringToArray,
  directionArrayToString,
} from '~/utils/surfSpotUtils'
import { determineInitialOptions, LoaderData } from './index'
import {
  CheckboxOption,
  FormComponent,
  FormInput,
  InfoMessage,
  Rating,
} from '~/components'
import { Option } from '~/components/FormInput'
import { ForecastLink } from '../ForecastLinks'
import { LocationSection } from './LocationSection'
import { SpotDetailsSection } from './SpotDetailsSection'
import { BestConditionsSection } from './BestConditionsSection'
import { AccessAmenitiesSection } from './AccessAmenitiesSection'
import {
  Availability,
  ACCOMMODATION_TYPES,
  FOOD_OPTIONS,
  FACILITIES,
  HAZARDS,
} from '~/types/formData/surfSpots'

interface SurfSpotFormProps {
  actionType: 'Add' | 'Edit'
  onCancel?: () => void
}

export const SurfSpotForm = (props: SurfSpotFormProps) => {
  const { actionType, onCancel } = props
  const { state } = useNavigation()
  const loading = state === 'loading'

  const { continents, surfSpot } = useLoaderData<LoaderData>()

  const { settings } = useSettingsContext()
  const { preferredUnits } = settings

  const distanceUnits = preferredUnits === 'metric' ? 'km' : 'mi'
  const waveUnits = preferredUnits === 'metric' ? 'm' : 'ft'

  const submitStatus = useSubmitStatus()

  const [findOnMap, setFindOnMap] = useState(true)

  // Fetch user's location immediately for "Add" mode
  // Start with default, then update when user location is fetched
  const [initialUserCoords, setInitialUserCoords] = useState<Coordinates>(
    actionType === 'Add' && !surfSpot
      ? defaultMapCenter
      : { longitude: 0, latitude: 0 },
  )

  useEffect(() => {
    if (actionType === 'Edit' || surfSpot) return

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
          }

          setInitialUserCoords(coords)
        },
        (error) => {
          console.error('Error getting initial user location:', error)
          // Keep default location on error
        },
        {
          enableHighAccuracy: true, // Prefer GPS over IP-based location
          timeout: 15000, // Increased timeout to allow GPS to get a fix
          maximumAge: 0, // Don't use cached location, always get fresh location
        },
      )
    }
  }, [actionType, surfSpot])
  const [spotStatus, setSpotStatus] = useState(
    surfSpot?.status || SurfSpotStatus.PENDING,
  )
  const [isBoatRequired, setIsBoatRequired] = useState(!!surfSpot?.boatRequired)
  const [isWavepool, setIsWavepool] = useState(!!surfSpot?.isWavepool)
  const [wavepoolUrl, setWavepoolUrl] = useState(surfSpot?.wavepoolUrl || '')

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

  // Determine initial coordinates - use surfSpot if editing, otherwise use initialUserCoords
  const getInitialCoordinates = () => {
    if (surfSpot?.longitude && surfSpot?.latitude) {
      return {
        longitude: surfSpot.longitude,
        latitude: surfSpot.latitude,
      }
    }
    // For "Add" mode, use initialUserCoords (starts as default, updates to user location)
    return {
      longitude: initialUserCoords.longitude,
      latitude: initialUserCoords.latitude,
    }
  }

  const initialCoords = getInitialCoordinates()

  const { formState, errors, isFormValid, handleChange, handleBlur } =
    useFormValidation({
      initialFormState: {
        continent: surfSpot?.continent?.slug || '',
        country: surfSpot?.country?.id || '',
        region: surfSpot?.region?.id || '',
        name: surfSpot?.name || '',
        type: surfSpot?.type || '',
        beachBottomType: surfSpot?.beachBottomType || '',
        description: surfSpot?.description || '',
        longitude: initialCoords.longitude,
        latitude: initialCoords.latitude,
        swellDirection: directionArrayToString(initialSwellDirection),
        windDirection: directionArrayToString(initialWindDirection),
        rating: surfSpot?.rating ?? '',
        tide: surfSpot?.tide || '',
        waveDirection: surfSpot?.waveDirection || '',
        minSurfHeight: surfSpot?.minSurfHeight ?? '',
        maxSurfHeight: surfSpot?.maxSurfHeight ?? '',
        parking: surfSpot?.parking || '',
        foodNearby: !!surfSpot?.foodNearby,
        skillLevel: surfSpot?.skillLevel || '',
        forecastLinks: (surfSpot?.forecasts as unknown as ForecastLink[]) || [],
        wavepoolUrl: surfSpot?.wavepoolUrl || '',
      } as SurfSpotFormState,
      validationFunctions: {
        continent: validateRequired,
        country: validateRequired,
        region: validateRequired,
        longitude: validateLongitude,
        latitude: validateLatitude,
        name: validateRequired,
        description: (value) => {
          // Description is only required for public spots (not private)
          if (isPrivateSpot) return ''
          return validateRequired(value, 'Description')
        },
        swellDirection: (value) => {
          if (isWavepool) return '' // Not required for wavepools
          return validateDirection(value, 'Swell Direction')
        },
        windDirection: (value) => {
          if (isWavepool) return '' // Not required for wavepools
          return validateDirection(value, 'Wind Direction')
        },
        forecastLinks: (links) => {
          if (!Array.isArray(links)) return 'Invalid data format'

          // Validate each link and update its errorMessage
          const updatedLinks = links.map((link) => ({
            ...link,
            errorMessage: validateUrl(link.url, 'Forecast Link') || '',
          }))

          // Only update state if the validation errors have changed
          if (JSON.stringify(links) !== JSON.stringify(updatedLinks)) {
            handleChange('forecastLinks', updatedLinks)
          }

          return ''
        },
        wavepoolUrl: (value) => {
          if (!isWavepool) return '' // Not required if not a wavepool
          if (!value || value.trim() === '') {
            return 'Official website is required for wavepools'
          }
          return validateUrl(value, 'Official Website')
        },
      },
    })

  // Update form coordinates when user location is fetched (for "Add" mode)
  useEffect(() => {
    if (actionType === 'Edit' || surfSpot) return

    // Check if user location is different from default (meaning it was fetched)
    const isUserLocation =
      initialUserCoords.longitude !== defaultMapCenter.longitude ||
      initialUserCoords.latitude !== defaultMapCenter.latitude

    // Only update if we have a user location and form still has default coordinates
    if (isUserLocation) {
      const isDefaultLocation =
        Math.abs((formState.longitude || 0) - defaultMapCenter.longitude) <
          0.0001 &&
        Math.abs((formState.latitude || 0) - defaultMapCenter.latitude) < 0.0001

      if (isDefaultLocation) {
        // Update both coordinates at once to ensure they're set together
        // This will trigger the map to update via initialCoordinates prop
        handleChange('longitude', initialUserCoords.longitude)
        handleChange('latitude', initialUserCoords.latitude)
      }
    }
  }, [
    actionType,
    surfSpot,
    initialUserCoords,
    formState.longitude,
    formState.latitude,
    handleChange,
  ])

  // Use location selection hook
  const locationSelection = useLocationSelection({
    findOnMap,
    longitude: formState.longitude,
    latitude: formState.latitude,
    continent: formState.continent,
    country: formState.country,
    region: formState.region,
    initialSurfSpot: surfSpot,
    onLocationChange: handleChange,
    initialUserLocation:
      initialUserCoords.longitude !== defaultMapCenter.longitude ||
      initialUserCoords.latitude !== defaultMapCenter.latitude
        ? initialUserCoords
        : null,
  })

  return (
    <div className="info-page-content mv map-content">
      <h1>{`${actionType} Surf Spot`}</h1>
      <InfoMessage message="Public surf spots are reviewed and, if approved, become visible to everyone." />
      <FormComponent
        loading={loading}
        isDisabled={!isFormValid}
        submitStatus={submitStatus}
        method={actionType === 'Edit' ? 'patch' : 'post'}
        onCancel={onCancel}
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
        <LocationSection
          findOnMap={findOnMap}
          onToggleView={() => setFindOnMap(!findOnMap)}
          formState={{
            continent: formState.continent,
            country: formState.country,
            region: formState.region,
            longitude: formState.longitude,
            latitude: formState.latitude,
          }}
          errors={{
            continent: errors.continent,
            country: errors.country,
            region: errors.region,
            longitude: errors.longitude,
            latitude: errors.latitude,
          }}
          continents={continents}
          locationSelection={locationSelection}
          onLocationChange={handleChange}
        />
        <h3 className="mt pt">Tell us about the spot</h3>
        <div className="pv">
          <CheckboxOption
            name="isWavepool"
            title="Wavepool?"
            description="Is this a wavepool?"
            checked={isWavepool}
            onChange={() => setIsWavepool(!isWavepool)}
          />
          {isWavepool && (
            <FormInput
              field={{
                label: 'Official Website',
                name: 'wavepoolUrl',
                type: 'text',
              }}
              value={wavepoolUrl || ''}
              onChange={(e) => {
                const value = e.target.value
                setWavepoolUrl(value)
                handleChange('wavepoolUrl', value)
              }}
              onBlur={() => handleBlur('wavepoolUrl')}
              errorMessage={errors.wavepoolUrl || ''}
              showLabel={!!wavepoolUrl}
            />
          )}
        </div>
        {!isWavepool && (
          <>
            <SpotDetailsSection
              formState={{
                type: formState.type,
                beachBottomType: formState.beachBottomType,
                skillLevel: formState.skillLevel,
                waveDirection: formState.waveDirection,
              }}
              errors={{
                type: errors.type,
                beachBottomType: errors.beachBottomType,
                skillLevel: errors.skillLevel,
                waveDirection: errors.waveDirection,
              }}
              onChange={handleChange}
            />
            <BestConditionsSection
              formState={{
                swellDirection: formState.swellDirection,
                windDirection: formState.windDirection,
                tide: formState.tide,
                minSurfHeight: formState.minSurfHeight,
                maxSurfHeight: formState.maxSurfHeight,
              }}
              errors={{
                swellDirection: errors.swellDirection,
                windDirection: errors.windDirection,
                tide: errors.tide,
                minSurfHeight: errors.minSurfHeight,
                maxSurfHeight: errors.maxSurfHeight,
              }}
              swellDirectionArray={swellDirectionArray}
              windDirectionArray={windDirectionArray}
              waveUnits={waveUnits}
              onSwellDirectionChange={setSwellDirectionArray}
              onWindDirectionChange={setWindDirectionArray}
              onChange={handleChange}
            />
          </>
        )}
        <AccessAmenitiesSection
          isBoatRequired={isBoatRequired}
          onBoatRequiredChange={setIsBoatRequired}
          accommodation={accommodation}
          onAccommodationChange={setAccommodation}
          food={food}
          onFoodChange={setFood}
          facilities={facilities}
          onFacilitiesChange={setFacilities}
          hazards={hazards}
          onHazardsChange={setHazards}
          formState={{
            parking: formState.parking,
            forecastLinks: formState.forecastLinks,
          }}
          errors={{
            parking: errors.parking,
            forecastLinks: errors.forecastLinks,
          }}
          distanceUnits={distanceUnits}
          onChange={handleChange}
        />
        <h4 className="mv">How would you rate this spot?</h4>
        <div className="rating-container">
          <Rating
            value={formState.rating}
            onChange={(value) => handleChange('rating', value)}
          />
          <p className="rating-description">
            Rate this spot based on wave quality, amenities, safety, and overall
            vibe. Focus on the spot itself, not just a single session.
          </p>
        </div>
      </FormComponent>
    </div>
  )
}
