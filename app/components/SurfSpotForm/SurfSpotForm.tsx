import { useState } from 'react'
import { useNavigation, useLoaderData } from 'react-router'

import { useSettingsContext } from '~/contexts'
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
  Page,
  Rating,
} from '~/components'
import { Option } from '~/components/FormInput'
import { ForecastLink } from '../ForecastLinks'
import {
  Availability,
  ACCOMMODATION_TYPES,
  FOOD_OPTIONS,
  FACILITIES,
  HAZARDS,
} from '~/types/formData'
import { LocationSection } from './LocationSection'
import { SpotDetailsSection } from './SpotDetailsSection'
import { BestConditionsSection } from './BestConditionsSection'
import { AccessAmenitiesSection } from './AccessAmenitiesSection'

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
          errorMessage: validateUrl(link.url, 'Forecast Link') || '',
        }))

        // Only update state if the validation errors have changed
        if (JSON.stringify(links) !== JSON.stringify(updatedLinks)) {
          handleChange('forecastLinks', updatedLinks)
        }

        return ''
      },
    },
  })

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
  })

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
              seasonStart: formState.seasonStart,
              seasonEnd: formState.seasonEnd,
            }}
            errors={{
              swellDirection: errors.swellDirection,
              windDirection: errors.windDirection,
              tide: errors.tide,
              minSurfHeight: errors.minSurfHeight,
              maxSurfHeight: errors.maxSurfHeight,
              seasonStart: errors.seasonStart,
              seasonEnd: errors.seasonEnd,
            }}
            swellDirectionArray={swellDirectionArray}
            windDirectionArray={windDirectionArray}
            waveUnits={waveUnits}
            onSwellDirectionChange={setSwellDirectionArray}
            onWindDirectionChange={setWindDirectionArray}
            onChange={handleChange}
          />
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
              Rate this spot based on wave quality, amenities, safety, and
              overall vibe. Focus on the spot itself, not just a single session.
            </p>
          </div>
        </FormComponent>
      </div>
    </Page>
  )
}
