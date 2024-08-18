import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'

import { Page, SurfSpotForm } from '../Components'
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

const SurfSpotEditor = () => {
  const { id } = useParams<{ id?: string }>()
  const dispatch: AppDispatch = useDispatch()
  const navigate = useNavigate()

  const isEditing = Boolean(id)

  // Use the selector for fetching surf spot by ID
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

  // Only fetch the surf spot if in editing mode and the data is not already present
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

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prevForm) => ({
      ...prevForm,
      [name]:
        name === 'longitude' || name === 'latitude' ? parseFloat(value) : value,
    }))
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
      navigate('/overview')
    } catch (err) {
      console.error(err)
    }
  }

  if (loading && isEditing) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <Page
      title={isEditing ? 'Edit Surf Spot' : 'Add Surf Spot'}
      content={
        <SurfSpotForm
          {...{
            form,
            onChange,
            onSubmit,
            onReturn: () => navigate('/overview'),
            loading,
            error,
          }}
        />
      }
    />
  )
}

export default SurfSpotEditor
