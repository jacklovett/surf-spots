import React from 'react'
import { SurfSpot, Coordinates } from '../../Controllers/surfSpotsTypes'

interface SurfSpotFormProps {
  form: SurfSpot | Partial<SurfSpot>
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
  error: string | null
}

const SurfSpotForm: React.FC<SurfSpotFormProps> = ({
  form,
  onChange,
  onSubmit,
  loading,
  error,
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div>
        <label htmlFor="country">Country</label>
        <input
          type="text"
          id="country"
          name="country"
          value={form.country || ''}
          onChange={onChange}
          required
        />
      </div>
      <div>
        <label htmlFor="region">Region</label>
        <input
          type="text"
          id="region"
          name="region"
          value={form.region || ''}
          onChange={onChange}
          required
        />
      </div>
      <div>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={form.name || ''}
          onChange={onChange}
          required
        />
      </div>
      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={form.description || ''}
          onChange={onChange}
          required
        />
      </div>
      <div>
        <label htmlFor="longitude">Longitude</label>
        <input
          type="number"
          step="any"
          id="longitude"
          name="longitude"
          value={(form.coordinates as Coordinates)?.longitude || 0}
          onChange={onChange}
          required
        />
      </div>
      <div>
        <label htmlFor="latitude">Latitude</label>
        <input
          type="number"
          step="any"
          id="latitude"
          name="latitude"
          value={(form.coordinates as Coordinates)?.latitude || 0}
          onChange={onChange}
          required
        />
      </div>
      <div>
        <label htmlFor="rating">Rating</label>
        <input
          type="number"
          step="0.1"
          id="rating"
          name="rating"
          value={form.rating || 0}
          onChange={onChange}
          min="0"
          max="10"
          required
        />
      </div>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}

export default SurfSpotForm
