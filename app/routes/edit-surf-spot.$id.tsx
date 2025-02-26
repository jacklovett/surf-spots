import { useEffect } from 'react'
import { useLoaderData, useNavigation, useParams } from '@remix-run/react'

import { get } from '~/services/networkService'
import { requireSessionCookie } from '~/services/session.server'
import { SurfSpot, SurfSpotType } from '~/types/surfSpots'

import { FormComponent, FormInput, Page } from '~/components'
import { useFormValidation, useSubmitStatus } from '~/hooks'
import { validateRequired } from '~/hooks/useFormValidation'

interface LoaderData {
  surfSpot: SurfSpot
}

export const loader = async (
  request: Request,
  params: { surfSpotId: string },
) => {
  await requireSessionCookie(request)

  const { surfSpotId } = params
  const surfSpot = await get<SurfSpot>(`/api/surf-spots/${surfSpotId}`)

  if (!surfSpot) {
    throw new Error('Surf spot details not found')
  }

  return { surfSpot }
}

export default function EditSurfSpot() {
  const { state } = useNavigation()
  const loading = state === 'loading'

  const { id } = useParams()

  if (!id) {
    throw new Error('No surf spot to edit')
  }

  const { surfSpot } = useLoaderData<LoaderData>()

  const { formState, errors, isFormValid, handleChange, setFormState } =
    useFormValidation({
      initialFormState: {
        country: '',
        continent: 'Asia',
        region: '',
        name: '',
        type: SurfSpotType.BeachBreak,
        description: '',
        longitude: `${0}`,
        latitude: `${0}`,
        rating: `${0}`,
      },
      validationFunctions: {
        country: validateRequired,
        continent: validateRequired,
        region: validateRequired,
        name: validateRequired,
        type: validateRequired,
        longitude: validateRequired,
        latitude: validateRequired,
        rating: validateRequired,
      },
    })

  useEffect(() => {
    if (surfSpot) {
      const { description, name, longitude, latitude } = surfSpot
      setFormState({
        description,
        name,
        longitude: `${longitude}`,
        latitude: `${latitude}`,
      })
    }
  }, [])

  const submitStatus = useSubmitStatus()

  return (
    <Page showHeader>
      <div className="column center-vertical mv">
        <div className="page-content">
          <h1 className="mt"> Edit Surf Spot</h1>
          <FormComponent
            loading={loading}
            submitStatus={submitStatus}
            isDisabled={!isFormValid}
          >
            <FormInput
              field={{
                label: 'Name',
                name: 'name',
                type: 'text',
                validationRules: {
                  required: true,
                  minLength: 2,
                  maxLength: 50,
                  validationMessage: 'Name is required (2-50 characters).',
                },
              }}
              value={formState.name}
              onChange={(e) => handleChange('name', e.target.value)}
              errorMessage={errors.name || ''}
              showLabel={!!formState.name}
            />
            <FormInput
              field={{
                label: 'Country',
                name: 'country',
                type: 'text',
                validationRules: {
                  required: true,
                  minLength: 2,
                  maxLength: 50,
                  validationMessage: 'Country is required (2-50 characters).',
                },
              }}
              value={formState.country}
              onChange={(e) => handleChange('country', e.target.value)}
              errorMessage={errors.country || ''}
              showLabel={!!formState.country}
            />
            <FormInput
              field={{
                label: 'Region',
                name: 'region',
                type: 'text',
                validationRules: {
                  required: true,
                  validationMessage: 'Region is required.',
                },
              }}
              value={formState.region}
              onChange={(e) => handleChange('region', e.target.value)}
              errorMessage={errors.region || ''}
              showLabel={!!formState.region}
            />
            <FormInput
              field={{
                label: 'Rating',
                name: 'rating',
                type: 'number',
                validationRules: {
                  required: true,
                  min: 0,
                  max: 5,
                  validationMessage: 'Rating must be between 0 and 5.',
                },
              }}
              value={formState.rating}
              onChange={(e) => handleChange('rating', e.target.value)}
              errorMessage={errors.rating || ''}
              showLabel={!!formState.rating}
            />
            <div className="form-inline">
              <FormInput
                field={{
                  label: 'Longitude',
                  name: 'longitude',
                  type: 'number',
                  validationRules: {
                    required: false,
                    min: -180,
                    max: 180,
                    validationMessage:
                      'Longitude must be between -180 and 180.',
                  },
                }}
                value={formState.longitude}
                onChange={(e) => handleChange('longitude', e.target.value)}
                errorMessage={errors.longitude || ''}
                showLabel={!!formState.longitude}
              />
              <FormInput
                field={{
                  label: 'Latitude',
                  name: 'latitude',
                  type: 'number',
                  validationRules: {
                    required: false,
                    min: -90,
                    max: 90,
                    validationMessage: 'Latitude must be between -90 and 90.',
                  },
                }}
                value={formState.latitude}
                onChange={(e) => handleChange('latitude', e.target.value)}
                errorMessage={errors.latitude || ''}
                showLabel={!!formState.latitude}
              />
            </div>
            <FormInput
              field={{
                label: 'Type',
                name: 'type',
                type: 'select',
                options: [
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
              value={formState.type}
              errorMessage={errors.type || ''}
              showLabel={!!formState.type}
            />
            <FormInput
              field={{
                label: 'Description',
                name: 'description',
                type: 'textarea',
                validationRules: {
                  minLength: 10,
                  maxLength: 150,
                  validationMessage:
                    'Description must be between 10 and 300 characters.',
                },
              }}
              onChange={(e) => handleChange('description', e.target.value)}
              value={formState.description}
              errorMessage={errors.description || ''}
              showLabel={!!formState.description}
            />
          </FormComponent>
        </div>
      </div>
    </Page>
  )
}
