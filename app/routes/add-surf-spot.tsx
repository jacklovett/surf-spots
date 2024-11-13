import { LoaderFunction } from '@remix-run/node'
import { useNavigate } from '@remix-run/react'
import { useState, ChangeEvent, FocusEvent } from 'react'

import { requireSessionCookie } from '~/services/session.server'
import { SurfSpot, SurfSpotType } from '~/types/surfSpots'

import { FormComponent, FormInput, Page } from '~/components'

export const loader: LoaderFunction = async ({ request }) => {
  await requireSessionCookie(request)
}

export default function AddSurfSpot() {
  const navigate = useNavigate()

  const loading = false
  const error = null

  const [form, setForm] = useState<Partial<SurfSpot>>({
    country: '',
    continent: 'Asia',
    region: '',
    name: '',
    type: SurfSpotType.BeachBreak,
    description: '',
    longitude: 0,
    latitude: 0,
    rating: 0,
  })

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  // New helper function that handles form input changes
  const handleInputChange = (name: string, value: string | number) => {
    setForm((prevForm) => {
      // Ensure the coordinates object is always present
      const updatedCoordinates = {
        longitude: prevForm.longitude ?? 0,
        latitude: prevForm.latitude ?? 0,
      }

      if (name === 'longitude' || name === 'latitude') {
        return {
          ...prevForm,
          coordinates: {
            ...updatedCoordinates, // Safely update nested coordinates
            [name]: parseFloat(value as string),
          },
        }
      }

      // Handle all other fields
      return {
        ...prevForm,
        [name]: value,
      }
    })
  }

  // Updated onChange event handler that uses handleInputChange
  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    handleInputChange(name, value) // Simply call the helper function here
  }

  const onBlur = (
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setTouchedFields((prev) => new Set(prev).add(e.target.name))

  return (
    <Page showHeader error={error}>
      <div className="column center-vertical">
        <h3>Add Surf Spot</h3>
        <FormComponent loading={loading} isDisabled={false} submitStatus={null}>
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
            value={form.name || ''}
            onChange={onChange}
            onBlur={onBlur}
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
            value={form.country || ''}
            onChange={onChange}
            onBlur={onBlur}
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
            value={form.region || ''}
            onChange={onChange}
            onBlur={onBlur}
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
            value={form.rating || 0}
            onChange={onChange}
            onBlur={onBlur}
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
                  validationMessage: 'Longitude must be between -180 and 180.',
                },
              }}
              value={form.longitude || ''}
              onChange={onChange}
              onBlur={onBlur}
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
              value={form?.latitude || ''}
              onChange={onChange}
              onBlur={onBlur}
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
            onChange={onChange}
            onBlur={onBlur}
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
            value={form.description || ''}
            onChange={onChange}
            onBlur={onBlur}
          />
        </FormComponent>
      </div>
    </Page>
  )
}
