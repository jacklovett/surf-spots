import React, { ChangeEvent, FormEvent, useState, useEffect } from 'react'
import { SurfSpot, Coordinates } from '../../Controllers/surfSpotController'
import Button from '../Button'

interface IProps {
  form: SurfSpot | Partial<SurfSpot>
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSubmit: (e: FormEvent) => void
  onReturn: () => void
  loading: boolean
  error: string | null
}

const SurfSpotForm = (props: IProps) => {
  const { form, onChange, onSubmit, onReturn, loading, error } = props

  const [isFormValid, setIsFormValid] = useState(false)
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Check form validity whenever form values change
    const formElement = document.querySelector('form') as HTMLFormElement
    setIsFormValid(formElement?.checkValidity() ?? false)
  }, [form])

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setTouchedFields((prev) => new Set(prev).add(e.target.name))
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onChange(e)
  }

  const getFieldError = (name: string, validationMessage: string) => {
    if (touchedFields.has(name)) {
      const value = form[name as keyof SurfSpot]

      if (name === 'description') {
        // Description is optional: only validate if it has a value
        return typeof value === 'string' &&
          (value.length < 10 || value.length > 150) ? (
          <span className="form-error">{validationMessage}</span>
        ) : null
      }

      // Other fields: must be present
      return !value ? (
        <span className="form-error">{validationMessage}</span>
      ) : null
    }
    return null
  }

  return (
    <form className="card" onSubmit={onSubmit} noValidate>
      <div className="form-item">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={form.name || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          minLength={2}
          maxLength={50}
          required
        />
        {getFieldError('name', 'Name is required (2-50 characters).')}
      </div>

      <div className="form-item">
        <label htmlFor="country">Country</label>
        <input
          type="text"
          id="country"
          name="country"
          value={form.country || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          minLength={2}
          maxLength={50}
          required
        />
        {getFieldError('country', 'Country is required (2-50 characters).')}
      </div>

      <div className="form-item">
        <label htmlFor="region">Region</label>
        <input
          type="text"
          id="region"
          name="region"
          value={form.region || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          required
        />
        {getFieldError('region', 'Region is required.')}
      </div>

      <div className="form-item">
        <label htmlFor="rating">Rating</label>
        <input
          type="number"
          step="0.1"
          id="rating"
          name="rating"
          value={form.rating || 0}
          onChange={handleChange}
          onBlur={handleBlur}
          min="0"
          max="10"
          required
        />
        {getFieldError('rating', 'Rating must be between 0 and 10.')}
      </div>

      <div className="coordinates center-horizontal">
        <div className="form-item coordinate">
          <label htmlFor="longitude">Longitude</label>
          <input
            type="number"
            step="any"
            id="longitude"
            name="longitude"
            value={(form.coordinates as Coordinates)?.longitude || 0}
            onChange={handleChange}
            onBlur={handleBlur}
            min="-180"
            max="180"
            required
          />
          {getFieldError(
            'longitude',
            'Longitude must be between -180 and 180.',
          )}
        </div>

        <div className="form-item coordinate">
          <label htmlFor="latitude">Latitude</label>
          <input
            type="number"
            step="any"
            id="latitude"
            name="latitude"
            value={(form.coordinates as Coordinates)?.latitude || 0}
            onChange={handleChange}
            onBlur={handleBlur}
            min="-90"
            max="90"
            required
          />
          {getFieldError('latitude', 'Latitude must be between -90 and 90.')}
        </div>
      </div>

      <div className="form-item">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={form.description || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          minLength={10}
          maxLength={150}
        />
        {getFieldError(
          'description',
          'Description must be between 10 and 150 characters.',
        )}
      </div>

      {error && <p className="error">{error}</p>}

      <div className="center-horizontal actions">
        <Button
          label="Back"
          type="button"
          disabled={loading}
          onClick={onReturn}
        />
        <Button
          label={loading ? 'Submitting...' : 'Submit'}
          type="submit"
          disabled={loading || !isFormValid}
          onClick={() => {}}
        />
      </div>
    </form>
  )
}

export default SurfSpotForm
