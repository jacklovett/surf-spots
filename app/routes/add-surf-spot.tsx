import { useState } from 'react'
import { LoaderFunction, useNavigation } from 'react-router'

import { requireSessionCookie } from '~/services/session.server'
import {
  BeachBottomType,
  SurfSpotStatus,
  SurfSpotType,
  Tide,
} from '~/types/surfSpots'

import {
  CheckboxOption,
  ErrorBoundary,
  FormComponent,
  FormInput,
  InfoMessage,
  Page,
  Rating,
  SurfMap,
  TextButton,
  ViewSwitch,
} from '~/components'
import { useFormValidation, useSubmitStatus } from '~/hooks'
import {
  validateDirection,
  validateLatitude,
  validateLongitude,
  validateRequired,
} from '~/hooks/useFormValidation'
import { MONTH_LIST } from '~/types/dateTimes'
import { useSettings } from '~/contexts'

export const loader: LoaderFunction = async ({ request }) => {
  await requireSessionCookie(request)
  return null
}

export default function AddSurfSpot() {
  const { state } = useNavigation()
  const loading = state === 'loading'

  const { settings } = useSettings()
  const { preferredUnits } = settings
  const units = preferredUnits === 'metric' ? 'm' : 'ft'

  const submitStatus = useSubmitStatus()

  const [findOnMap, setFindOnMap] = useState(true)
  const [spotStatus, setSpotStatus] = useState(SurfSpotStatus.Pending)

  const isPrivateSpot = spotStatus === SurfSpotStatus.Private

  const { formState, errors, isFormValid, handleChange } = useFormValidation({
    initialFormState: {
      country: '',
      continent: '',
      region: '',
      name: '',
      type: '',
      beachBottomType: '',
      description: '',
      longitude: '',
      latitude: '',
      swellDirection: '',
      windDirection: '',
      rating: '',
      tide: '',
      minSurfHeight: '',
      maxSurfHeight: '',
      seasonStart: '',
      seasonEnd: '',
    },
    validationFunctions: {
      country: validateRequired,
      continent: validateRequired,
      region: validateRequired,
      longitude: validateLongitude,
      latitude: validateLatitude,
      name: validateRequired,
      description: (value) => (!isPrivateSpot ? validateRequired(value) : ''),
      type: (value) => (!isPrivateSpot ? validateRequired(value) : ''),
      beachBottomType: (value) =>
        !isPrivateSpot ? validateRequired(value) : '',
      swellDirection: (value) =>
        validateDirection(value, !isPrivateSpot, 'Swell Direction'),
      windDirection: (value) =>
        validateDirection(value, !isPrivateSpot, 'Wind Direction'),
      tide: (value) => (!isPrivateSpot ? validateRequired(value) : ''),
      minSurfHeight: (value) => (!isPrivateSpot ? validateRequired(value) : ''),
      maxSurfHeight: (value) => (!isPrivateSpot ? validateRequired(value) : ''),
      seasonStart: (value) => (!isPrivateSpot ? validateRequired(value) : ''),
      seasonEnd: (value) => (!isPrivateSpot ? validateRequired(value) : ''),
    },
  })

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
              title="Keep Private"
              description="Only you will be able to see this spot. Your secret is safe with us!"
              checked={isPrivateSpot}
              onChange={() =>
                setSpotStatus(
                  isPrivateSpot
                    ? SurfSpotStatus.Pending
                    : SurfSpotStatus.Private,
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
            <div className="form-inline">
              <FormInput
                field={{
                  label: 'Country',
                  name: 'country',
                  type: 'text',
                }}
                value={formState.country}
                onChange={(e) => handleChange('country', e.target.value)}
                errorMessage={errors.country || ''}
                showLabel={!!formState.country}
                disabled={findOnMap}
              />
              <FormInput
                field={{
                  label: 'Region',
                  name: 'region',
                  type: 'text',
                }}
                value={formState.region}
                onChange={(e) => handleChange('region', e.target.value)}
                errorMessage={errors.region || ''}
                showLabel={!!formState.region}
                disabled={findOnMap}
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
                onChange={(e) => handleChange('longitude', e.target.value)}
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
                onChange={(e) => handleChange('latitude', e.target.value)}
                errorMessage={errors.latitude || ''}
                showLabel={!!formState.latitude}
                disabled={findOnMap}
              />
            </div>
            <h3 className="mt pt">Tell us about the spot</h3>
            <div className="form-inline">
              <FormInput
                field={{
                  label: 'Type',
                  name: 'type',
                  type: 'select',
                  options: [
                    { key: '', value: '', label: 'Select an option' },
                    {
                      key: SurfSpotType.BeachBreak,
                      value: SurfSpotType.BeachBreak,
                      label: SurfSpotType.BeachBreak,
                    },
                    {
                      key: SurfSpotType.PointBreak,
                      value: SurfSpotType.PointBreak,
                      label: 'Point Break',
                    },
                    {
                      key: SurfSpotType.ReefBreak,
                      value: SurfSpotType.ReefBreak,
                      label: 'Reef Break',
                    },
                  ],
                }}
                onChange={(e) => handleChange('type', e.target.value)}
                errorMessage={errors.type || ''}
                value={formState.type}
                showLabel
              />
              <FormInput
                field={{
                  label: 'Beach Bottom Type',
                  name: 'beachBottomType',
                  type: 'select',
                  options: [
                    { key: '', value: '', label: 'Select an option' },
                    {
                      key: BeachBottomType.Sand,
                      value: BeachBottomType.Sand,
                      label: 'Sand',
                    },
                    {
                      key: BeachBottomType.Reef,
                      value: BeachBottomType.Reef,
                      label: 'Reef',
                    },
                    {
                      key: BeachBottomType.Rock,
                      value: BeachBottomType.Rock,
                      label: 'Rock',
                    },
                  ],
                }}
                onChange={(e) =>
                  handleChange('beachBottomType', e.target.value)
                }
                errorMessage={errors.beachBottomType || ''}
                value={formState.beachBottomType}
                showLabel
              />
            </div>
            <h4 className="m-0 pt">Best Conditions</h4>
            <div className="form-inline">
              <FormInput
                field={{
                  label: 'Swell Direction',
                  name: 'swellDirection',
                  type: 'text',
                }}
                value={formState.swellDirection}
                onChange={(e) => handleChange('swellDirection', e.target.value)}
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
                onChange={(e) => handleChange('windDirection', e.target.value)}
                errorMessage={errors.windDirection || ''}
                showLabel={!!formState.windDirection}
              />
            </div>
            <FormInput
              field={{
                label: 'Tide',
                name: 'tide',
                type: 'select',
                options: [
                  { key: '', value: '', label: 'Select an option' },
                  {
                    key: Tide.Low,
                    value: Tide.Low,
                    label: 'Low',
                  },
                  {
                    key: Tide.LowMid,
                    value: Tide.LowMid,
                    label: 'Low - Mid',
                  },
                  {
                    key: Tide.Mid,
                    value: Tide.Mid,
                    label: 'Mid',
                  },
                  {
                    key: Tide.MidHigh,
                    value: Tide.MidHigh,
                    label: 'Mid - High',
                  },
                  {
                    key: Tide.High,
                    value: Tide.High,
                    label: 'High',
                  },
                ],
              }}
              onChange={(e) => handleChange('tide', e.target.value)}
              errorMessage={errors.tide || ''}
              value={formState.tide}
              showLabel
            />
            <p className="m-0 pt bold">Ideal Surf Height</p>
            <div className="form-inline">
              <FormInput
                field={{
                  label: `Min Surf Height (${units})`,
                  name: 'minSurfHeight',
                  type: 'number',
                }}
                value={formState.minSurfHeight}
                onChange={(e) => handleChange('minSurfHeight', e.target.value)}
                errorMessage={errors.minSurfHeight || ''}
                showLabel={!!formState.minSurfHeight}
              />
              <FormInput
                field={{
                  label: `Max Surf Height (${units})`,
                  name: 'maxSurfHeight',
                  type: 'number',
                }}
                value={formState.maxSurfHeight}
                onChange={(e) => handleChange('maxSurfHeight', e.target.value)}
                errorMessage={errors.maxSurfHeight || ''}
                showLabel={!!formState.maxSurfHeight}
              />
            </div>
            <p className="m-0 pt bold">When is the best time to go?</p>
            <div className="form-inline">
              <FormInput
                field={{
                  label: 'Season Starts',
                  name: 'seasonStart',
                  type: 'select',
                  options: [
                    { key: '', value: '', label: 'Select an option' },
                    ...MONTH_LIST,
                  ],
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
                  options: [
                    { key: '', value: '', label: 'Select an option' },
                    ...MONTH_LIST,
                  ],
                }}
                onChange={(e) => handleChange('seasonEnd', e.target.value)}
                errorMessage={errors.seasonEnd || ''}
                value={formState.seasonEnd}
                showLabel
              />
            </div>
            <h3 className="mt pt">Amenities</h3>
            <h4>Accessibility</h4>
            <h4 className="mv">How would you rate this spot?</h4>
            <div className="rating-container">
              <Rating
                value={parseInt(formState.rating, 10) || 0} // Convert the rating to a number
                onChange={(value) => handleChange('rating', value.toString())}
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
