import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import SurfSpotForm from '../Components/SurfSpotForm/SurfSpotForm'

import { SurfSpot, UpdatedSurfSpot } from '../Controllers/surfSpotsTypes'
import { AppDispatch } from '../Store'
import {
  addNewSurfSpot,
  editSurfSpot,
  fetchSurfSpotById,
  selectSurfSpotsState,
} from '../Store/surfSpots'

const SurfSpotEditor = () => {
  const { id } = useParams<{ id?: string }>()
  const dispatch: AppDispatch = useDispatch()
  const navigate = useNavigate()
  const [form, setForm] = useState<Partial<SurfSpot>>({
    country: '',
    region: '',
    name: '',
    description: '',
    coordinates: { longitude: 0, latitude: 0 },
    rating: 0,
  })

  const surfSpotState = useSelector(selectSurfSpotsState)
  const { loading, error } = surfSpotState

  const isEditing = Boolean(id)

  useEffect(() => {
    if (isEditing && id) {
      const fetchSpot = async () => {
        try {
          const spot = await dispatch(fetchSurfSpotById(id)).unwrap() // Unwrap the thunk result
          if (spot) {
            setForm(spot) // Only set the form if the spot is not null
          } else {
            console.error(`Surf spot with id ${id} was not found.`)
          }
        } catch (e) {
          console.error(e)
        }
      }
      fetchSpot()
    }
  }, [id, dispatch, isEditing])

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setForm((prevForm) => ({
      ...prevForm,
      [name]:
        name === 'longitude' || name === 'latitude' ? parseFloat(value) : value,
    }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEditing && id) {
        await dispatch(
          editSurfSpot({ id, updatedSpot: form as UpdatedSurfSpot }),
        ).unwrap() // Unwrap the thunk result
      } else {
        await dispatch(addNewSurfSpot(form as SurfSpot)).unwrap() // Unwrap the thunk result
      }
      navigate('/')
    } catch (err) {
      console.error(err)
    }
  }

  if (loading && isEditing) return <p>Loading...</p>

  return (
    <div>
      <h1>{isEditing ? 'Edit Surf Spot' : 'Add Surf Spot'}</h1>
      <SurfSpotForm {...{ form, onChange, onSubmit, loading, error }} />
    </div>
  )
}

export default SurfSpotEditor
