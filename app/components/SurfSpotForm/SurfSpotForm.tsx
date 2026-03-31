import { useState, useEffect, useCallback, FormEvent } from 'react'
import { useLoaderData, useFetcher, useNavigate } from 'react-router'

import { useSettingsContext } from '~/contexts'
import { defaultMapCenter } from '~/services/mapService'
import { Coordinates } from '~/types/surfSpots'
import {
  useSubmitStatus,
  useFormValidation,
  useLocationSelection,
  useSurfSpotWizard,
} from '~/hooks'
import { validateUrl } from '~/hooks/useFormValidation'
import { SurfSpot, SurfSpotStatus, SurfSpotFormState } from '~/types/surfSpots'
import {
  directionStringToArray,
  directionArrayToString,
} from '~/utils/surfSpotUtils'
import { ActionData } from '~/types/api'
import { determineInitialOptions, LoaderData } from './index'
import {
  Button,
  CheckboxOption,
  FormComponent,
  FormInput,
  Icon,
  InfoMessage,
} from '~/components'
import { Option } from '~/components/FormInput'
import { UrlLinkItem } from '../UrlLinkList'
import {
  getSurfSpotStepValidators,
  isPublicListingComplete,
} from '~/utils/surfSpotWizardValidation'
import {
  getFetcherSubmitStatus,
  ERROR_ADD_SURF_SPOT,
} from '~/utils/errorUtils'
import { roundCoordinate } from '~/utils/coordinateUtils'
import { buildSurfSpotFormData } from '~/utils/buildSurfSpotFormData'
import { WizardStepper } from './WizardStepper'
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

/**
 * Returns the app route for surf spot details (`surfSpot.path` from the API).
 * Used for "View spot" after save; null if the API did not send a path.
 */
const detailsPagePathFromSurfSpot = (
  surfSpot: SurfSpot | null,
): string | null => {
  if (surfSpot == null) return null
  const path = surfSpot.path
  if (typeof path !== 'string' || path.trim() === '') return null
  return path.trim()
}

export const SurfSpotForm = (props: SurfSpotFormProps) => {
  const { actionType, onCancel } = props

  const { continents, surfSpot } = useLoaderData<LoaderData>()

  const { settings } = useSettingsContext()
  const { preferredUnits } = settings

  const distanceUnits = preferredUnits === 'metric' ? 'km' : 'mi'
  const waveUnits = preferredUnits === 'metric' ? 'm' : 'ft'

  const fetcher = useFetcher<ActionData>()
  const actionSubmitStatus = useSubmitStatus()
  const fetcherSubmitStatus = getFetcherSubmitStatus(
    fetcher.data,
    ERROR_ADD_SURF_SPOT,
  )
  const submitStatus =
    fetcherSubmitStatus != null ? fetcherSubmitStatus : actionSubmitStatus

  const [findOnMap, setFindOnMap] = useState(true)
  const isAddMode = actionType === 'Add'

  // Fetch user's location immediately for "Add" mode
  // Start with default, then update when user location is fetched
  const [initialUserCoords, setInitialUserCoords] = useState<Coordinates>(
    isAddMode && !surfSpot
      ? defaultMapCenter
      : { longitude: 0, latitude: 0 },
  )

  useEffect(() => {
    if (!isAddMode || surfSpot) return

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            longitude: roundCoordinate(position.coords.longitude),
            latitude: roundCoordinate(position.coords.latitude),
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
  const isWavepoolInitial = !!surfSpot?.isWavepool
  const isRiverWaveInitial = !!surfSpot?.isRiverWave
  const isBothNoveltyInitial = isWavepoolInitial && isRiverWaveInitial
  const [isWavepool, setIsWavepool] = useState(isWavepoolInitial)
  const [wavepoolUrl, setWavepoolUrl] = useState(surfSpot?.wavepoolUrl || '')
  const [isRiverWave, setIsRiverWave] = useState(
    isBothNoveltyInitial ? false : isRiverWaveInitial,
  )
  const isNoveltyWave = isWavepool || isRiverWave

  useEffect(() => {
    if (!surfSpot || isAddMode) return
    setSpotStatus(surfSpot.status || SurfSpotStatus.PENDING)
    setIsBoatRequired(!!surfSpot.boatRequired)
    const nextIsWavepool = !!surfSpot.isWavepool
    const nextIsRiverWave = !!surfSpot.isRiverWave
    const nextIsBothNovelty = nextIsWavepool && nextIsRiverWave
    setIsWavepool(nextIsWavepool)
    setIsRiverWave(nextIsBothNovelty ? false : nextIsRiverWave)
    setWavepoolUrl(surfSpot.wavepoolUrl || '')
  }, [
    isAddMode,
    surfSpot?.id,
    surfSpot?.status,
    surfSpot?.boatRequired,
    surfSpot?.isWavepool,
    surfSpot?.wavepoolUrl,
    surfSpot?.isRiverWave,
  ])

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
        longitude: roundCoordinate(surfSpot.longitude),
        latitude: roundCoordinate(surfSpot.latitude),
      }
    }
    // For "Add" mode, use initialUserCoords (starts as default, updates to user location)
    return {
      longitude: roundCoordinate(initialUserCoords.longitude),
      latitude: roundCoordinate(initialUserCoords.latitude),
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
        tide: surfSpot?.tide || '',
        waveDirection: surfSpot?.waveDirection || '',
        minSurfHeight: surfSpot?.minSurfHeight ?? '',
        maxSurfHeight: surfSpot?.maxSurfHeight ?? '',
        parking: surfSpot?.parking || '',
        foodNearby: !!surfSpot?.foodNearby,
        skillLevel: surfSpot?.skillLevel || '',
        crowdLevel: surfSpot?.crowdLevel ?? '',
        forecastLinks: (surfSpot?.forecasts as unknown as UrlLinkItem[]) || [],
        webcamLinks: (surfSpot?.webcams as unknown as UrlLinkItem[]) || [],
        wavepoolUrl: surfSpot?.wavepoolUrl || '',
      } as SurfSpotFormState,
      validationFunctions: {
        ...getSurfSpotStepValidators({
          isPrivateSpot,
          isWavepool,
          isNoveltyWave,
        }),
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
        webcamLinks: (links) => {
          if (!Array.isArray(links)) return 'Invalid data format'

          const updatedLinks = links.map((link) => ({
            ...link,
            errorMessage: validateUrl(link.url, 'Webcam Link') || '',
          }))

          if (JSON.stringify(links) !== JSON.stringify(updatedLinks)) {
            handleChange('webcamLinks', updatedLinks)
          }

          return ''
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
        handleChange('longitude', roundCoordinate(initialUserCoords.longitude))
        handleChange('latitude', roundCoordinate(initialUserCoords.latitude))
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

  const {
    wizardSteps,
    currentStep,
    stepId,
    totalSteps,
    canProceedToNext,
    goNext,
    goBack,
  } = useSurfSpotWizard({
    isPrivateSpot,
    isWavepool,
    isNoveltyWave,
    formState,
  })

  const handleFormSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (
        !isPublicListingComplete({
          isPrivateSpot,
          isWavepool,
          isRiverWave,
          wavepoolUrl,
          formState,
        })
      ) {
        return
      }
      const formData = buildSurfSpotFormData({
        formState,
        isPrivateSpot,
        foodNearby: food.nearby,
        accommodationNearby: accommodation.nearby,
        isBoatRequired,
        isWavepool,
        wavepoolUrl,
        isRiverWave,
        foodOptions: food.options,
        accommodationOptions: accommodation.options,
        facilities,
        hazards,
      })
      if (!isAddMode && surfSpot?.id) {
        formData.append('surfSpotId', String(surfSpot.id))
      }
      fetcher.submit(formData, { method: isAddMode ? 'post' : 'patch' })
    },
    [
      fetcher,
      formState,
      isPrivateSpot,
      isWavepool,
      isRiverWave,
      wavepoolUrl,
      food.nearby,
      food.options,
      accommodation.nearby,
      accommodation.options,
      isBoatRequired,
      facilities,
      hazards,
      isAddMode,
      surfSpot?.id,
    ],
  )

  const navigate = useNavigate()
  const surfSpotFromActionResponse: SurfSpot | null =
    fetcher.data?.surfSpot ?? null

  const submitCompletedWithoutError =
    fetcher.data != null && fetcher.data.hasError !== true

  const detailsPathFromSavedSpot = detailsPagePathFromSurfSpot(
    surfSpotFromActionResponse,
  )
  const detailsPathFromLoaderSpot = detailsPagePathFromSurfSpot(
    surfSpot ?? null,
  )
  const urlToOpenSurfSpotDetails =
    detailsPathFromSavedSpot ?? detailsPathFromLoaderSpot

  const showSuccessScreen = isAddMode
    ? submitCompletedWithoutError && surfSpotFromActionResponse != null
    : submitCompletedWithoutError && urlToOpenSurfSpotDetails != null

  const afterSuccessLabel = isAddMode ? 'Add another' : 'Back to spot details'
  const afterSuccessPath = isAddMode
    ? '/add-surf-spot'
    : urlToOpenSurfSpotDetails

  return (
    <div
      className={`info-page-content mv map-content ${
        showSuccessScreen ? 'surf-spot-form-success-page' : ''
      }`}
    >
      {!showSuccessScreen && currentStep > 0 && (
        <div className="back-nav">
          <Button
            type="button"
            variant="icon"
            icon={{ name: 'chevron-left' }}
            onClick={goBack}
            ariaLabel="Back"
          />
        </div>
      )}
      <h1>{`${actionType} Surf Spot`}</h1>

      <WizardStepper
        steps={wizardSteps}
        currentStep={
          showSuccessScreen ? wizardSteps.length - 1 : currentStep
        }
        isComplete={showSuccessScreen}
      />

      {showSuccessScreen ? (
        <div className="surf-spot-form-success-wrapper">
          <div className="surf-spot-form-success column">
            <div className="ph center column">
              <div className="surf-spot-form-success-icon mb">
                <Icon iconKey="success" useCurrentColor />
              </div>
              <p className="surf-spot-form-success-message bold">
                {submitStatus?.message}
              </p>
              <p className="surf-spot-form-success-subtext">
                {isAddMode ? 'You can now view the spot or add another.' : 'Your changes have been saved.'}
              </p>
              <div className="surf-spot-form-success-actions">
                <Button
                  label={isAddMode ? 'View surf spot' : 'View spot'}
                  onClick={() => {
                    if (urlToOpenSurfSpotDetails) {
                      navigate(urlToOpenSurfSpotDetails)
                    }
                  }}
                />
                {isAddMode && (
                  <Button
                    label={afterSuccessLabel}
                    variant="secondary"
                    onClick={() => {
                      if (afterSuccessPath) navigate(afterSuccessPath)
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
      <FormComponent
        isDisabled={!isFormValid}
        submitStatus={submitStatus}
        method={isAddMode ? 'post' : 'patch'}
        onCancel={onCancel}
        hideSubmitButton={currentStep < totalSteps - 1}
        onSubmit={handleFormSubmit}
        isSubmitting={fetcher.state === 'submitting'}
      >
        {stepId === 'basics' && (
        <>
        <FormInput
          field={{
            label: 'Name',
            name: 'name',
            type: 'text',
          }}
          value={formState.name}
          onChange={(event) => handleChange('name', event.target.value)}
          errorMessage={errors.name || ''}
          showLabel={!!formState.name}
          required
        />
        <FormInput
          field={{
            label: 'Description',
            name: 'description',
            type: 'textarea',
          }}
          onChange={(event) =>
            handleChange('description', event.target.value)
          }
          value={formState.description}
          errorMessage={errors.description || ''}
          showLabel={!!formState.description}
          required={!isPrivateSpot}
        />
        <div className="surf-spot-form-basics-spacer" />
        <InfoMessage message="Public surf spots are reviewed and, if approved, become visible to everyone." />
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
        </>
        )}

        {stepId === 'location' && (
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
        )}

        {stepId === 'spot-type' && (
        <>
        <h3 className="mt pt">Tell us about the spot</h3>
        <>
          <CheckboxOption
            name="isWavepool"
            title="Wavepool?"
            description="Is this a wavepool?"
            checked={isWavepool}
            onChange={() => {
              const next = !isWavepool
              setIsWavepool(next)
              if (next) setIsRiverWave(false)
            }}
          />
          <CheckboxOption
            name="isRiverWave"
            title="River wave?"
            description="Is this a river wave (standing wave / river break)?"
            checked={isRiverWave}
            onChange={() => {
              const next = !isRiverWave
              setIsRiverWave(next)
              if (next) {
                setIsWavepool(false)
                setWavepoolUrl('')
                handleChange('wavepoolUrl', '')
              }
            }}
          />
          {isWavepool && (
            <FormInput
              field={{
                label: 'Official Website',
                name: 'wavepoolUrl',
                type: 'text',
              }}
              value={wavepoolUrl || ''}
              onChange={(event) => {
                const value = event.target.value
                setWavepoolUrl(value)
                handleChange('wavepoolUrl', value)
              }}
              onBlur={() => handleBlur('wavepoolUrl')}
              errorMessage={errors.wavepoolUrl || ''}
              showLabel={!!wavepoolUrl}
              required
            />
          )}
        </>
        <SpotDetailsSection
          formState={{
            type: formState.type,
            beachBottomType: formState.beachBottomType,
            skillLevel: formState.skillLevel,
            waveDirection: formState.waveDirection,
            crowdLevel: formState.crowdLevel,
          }}
          errors={{
            type: errors.type,
            beachBottomType: errors.beachBottomType,
            skillLevel: errors.skillLevel,
            waveDirection: errors.waveDirection,
            crowdLevel: errors.crowdLevel,
          }}
          onChange={handleChange}
        />
        </>
        )}

        {stepId === 'details' && (
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
        )}

        {stepId === 'access' && (
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
            webcamLinks: formState.webcamLinks,
          }}
          errors={{
            parking: errors.parking,
            forecastLinks: errors.forecastLinks,
            webcamLinks: errors.webcamLinks,
          }}
          distanceUnits={distanceUnits}
          onChange={handleChange}
        />
        )}

        {currentStep < totalSteps - 1 && (
          <div className="center-horizontal form-submit">
            <Button
              type="button"
              label="Continue"
              onClick={goNext}
              disabled={!canProceedToNext}
            />
          </div>
        )}
      </FormComponent>
      )}
    </div>
  )
}
