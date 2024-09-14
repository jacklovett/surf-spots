import { useState, useEffect, ChangeEvent, FormEvent, FocusEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'

import {
  Coordinates,
  SurfSpot,
  SurfSpotType,
} from '../Controllers/surfSpotController'
import { AppDispatch } from '../Store'
import {
  selectSurfSpotById,
  selectSurfSpotsLoading,
  selectSurfSpotsError,
} from '../Store/surfSpots'
import { Page, Form, FormItem } from '../Components'
import {
  addNewSurfSpot,
  editSurfSpot,
  fetchSurfSpotById,
} from '../Services/surfSpotService'

const SurfSpotEditor = () => {
  const { id } = useParams<{ id?: string }>()
  const dispatch: AppDispatch = useDispatch()
  const navigate = useNavigate()

  const isEditing = Boolean(id)

  const surfSpot = useSelector(selectSurfSpotById(id || ''))
  const loading = useSelector(selectSurfSpotsLoading)
  const error = useSelector(selectSurfSpotsError)

  const [form, setForm] = useState<Partial<SurfSpot>>(
    surfSpot || {
      country: '',
      continent: 'Asia',
      region: '',
      name: '',
      type: SurfSpotType.BeachBreak,
      description: '',
      coordinates: { longitude: 0, latitude: 0 } as Coordinates,
      rating: 0,
    },
  )

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  // Fetch the surf spot if it is not already in the state
  useEffect(() => {
    if (id && !surfSpot) {
      dispatch(fetchSurfSpotById(id)).catch(console.error)
    }
  }, [id, isEditing, surfSpot, dispatch])

  // Update form state when surfSpot is available
  useEffect(() => {
    if (surfSpot) {
      setForm(surfSpot)
    }
  }, [surfSpot])

  // New helper function that handles form input changes
  const handleInputChange = (name: string, value: string | number) => {
    setForm((prevForm) => {
      // Ensure the coordinates object is always present
      const updatedCoordinates = prevForm.coordinates || {
        longitude: 0,
        latitude: 0,
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

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      if (isEditing && id) {
        await dispatch(editSurfSpot(id, form as SurfSpot))
      } else {
        await dispatch(addNewSurfSpot(form as SurfSpot))
      }
      navigate('/surf-spots')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Page
      showHeader
      content={
        <div className="column center-vertical">
          <h3>{isEditing ? 'Edit Surf Spot' : 'Add Surf Spot'}</h3>
          <Form
            onSubmit={onSubmit}
            onReturn={() => navigate('/surf-spots')}
            loading={loading}
            error={error}
          >
            <FormItem
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
              touchedFields={touchedFields}
            />
            <FormItem
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
              touchedFields={touchedFields}
            />
            <FormItem
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
              touchedFields={touchedFields}
            />
            <FormItem
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
              touchedFields={touchedFields}
            />
            <div className="coordinates">
              <FormItem
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
                value={form.coordinates?.longitude || ''}
                onChange={onChange}
                onBlur={onBlur}
                touchedFields={touchedFields}
              />
              <FormItem
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
                value={form.coordinates?.latitude || ''}
                onChange={onChange}
                onBlur={onBlur}
                touchedFields={touchedFields}
              />
            </div>
            <FormItem
              field={{
                label: 'Type',
                name: 'type',
                type: 'select',
                options: [
                  {
                    value: SurfSpotType.BeachBreak,
                    label: SurfSpotType.BeachBreak,
                  },
                  {
                    value: SurfSpotType.PointBreak,
                    label: 'Point Break',
                  },
                  {
                    value: SurfSpotType.ReefBreak,
                    label: 'Reef Break',
                  },
                ],
              }}
              onChange={onChange}
              onBlur={onBlur}
              touchedFields={touchedFields}
            />
            <FormItem
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
              touchedFields={touchedFields}
            />
          </Form>
        </div>
      }
      loading={loading}
      error={error}
    />
  )
}

export default SurfSpotEditor
