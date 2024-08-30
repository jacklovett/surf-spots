import { useState, useEffect, ChangeEvent, FormEvent, FocusEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'

import { SurfSpot } from '../Controllers/surfSpotController'
import { AppDispatch } from '../Store'
import {
  addNewSurfSpot,
  editSurfSpot,
  fetchSurfSpotById,
  selectSurfSpotById,
  selectSurfSpotsLoading,
  selectSurfSpotsError,
} from '../Store/surfSpots'
import { Page, Form, FormItem } from '../Components'

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
      description: '',
      coordinates: { longitude: 0, latitude: 0 },
      rating: 0,
    },
  )

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isEditing && id && !surfSpot) {
      dispatch(fetchSurfSpotById(id))
        .unwrap()
        .then((spot) => {
          if (spot) setForm(spot)
        })
        .catch(console.error)
    }
  }, [id, isEditing, surfSpot, dispatch])

  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setForm((prevForm) => ({
      ...prevForm,
      [name]:
        name === 'longitude' || name === 'latitude' ? parseFloat(value) : value,
    }))
  }

  const onBlur = (
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setTouchedFields((prev) => new Set(prev).add(e.target.name))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      if (isEditing && id) {
        await dispatch(
          editSurfSpot({ id, updatedSpot: form as SurfSpot }),
        ).unwrap()
      } else {
        await dispatch(addNewSurfSpot(form as SurfSpot)).unwrap()
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
                    required: true,
                    min: -180,
                    max: 180,
                    validationMessage:
                      'Longitude must be between -180 and 180.',
                  },
                }}
                value={form.coordinates?.longitude || 0}
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
                    required: true,
                    min: -90,
                    max: 90,
                    validationMessage: 'Latitude must be between -90 and 90.',
                  },
                }}
                value={form.coordinates?.latitude || 0}
                onChange={onChange}
                onBlur={onBlur}
                touchedFields={touchedFields}
              />
            </div>
            <FormItem
              field={{
                label: 'Description',
                name: 'description',
                type: 'textarea',
                validationRules: {
                  minLength: 10,
                  maxLength: 150,
                  validationMessage:
                    'Description must be between 10 and 150 characters.',
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
