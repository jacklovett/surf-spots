import {
  AddSurfSpotMap,
  FormInput,
  InfoMessage,
  ViewSwitch,
  TextButton,
  ErrorBoundary,
} from '~/components'
import { Continent, SurfSpotFormState } from '~/types/surfSpots'
import type { LocationSelection } from '~/hooks/useLocationSelection'

type FormChangeHandler = <K extends keyof SurfSpotFormState>(
  field: K,
  value: SurfSpotFormState[K],
) => void

interface LocationSectionProps {
  findOnMap: boolean
  onToggleView: () => void
  formState: {
    continent: string
    country: string
    region: string
    longitude?: number
    latitude?: number
  }
  errors: {
    continent?: string
    country?: string
    region?: string
    longitude?: string
    latitude?: string
  }
  continents: Continent[]
  locationSelection: LocationSelection
  onLocationChange: FormChangeHandler
  isAtUserLocation?: boolean
}

export const LocationSection = ({
  findOnMap,
  onToggleView,
  formState,
  errors,
  continents,
  locationSelection,
  onLocationChange,
  isAtUserLocation,
}: LocationSectionProps) => {
  const {
    filteredCountries,
    filteredRegions,
    isDeterminingLocation,
    countryName,
    regionName,
    regionNotFoundMessage,
    isMapReady,
    mapRef,
    handleLocationUpdate,
    handleUseMyLocation,
    setIsMapReady,
  } = locationSelection
  return (
    <>
      <h3 className="mv pt">Set Location</h3>
      <div className="mb row space-between">
        <ViewSwitch
          isPrimaryView={findOnMap}
          onToggleView={onToggleView}
          primaryLabel="Use Map"
          secondaryLabel="Enter Manually"
        />
        {findOnMap && (
          <div className="find-by-location">
            <TextButton
              text="Use my location"
              onClick={handleUseMyLocation}
              iconKey="crosshair"
              filled
              disabled={!isMapReady || isAtUserLocation}
            />
          </div>
        )}
      </div>
      {findOnMap && (
        <div className="find-spot-map">
          <ErrorBoundary message="Uh-oh! Something went wrong displaying the map!">
            <AddSurfSpotMap
              onLocationUpdate={handleLocationUpdate}
              initialCoordinates={
                formState.longitude && formState.latitude
                  ? {
                      longitude: formState.longitude,
                      latitude: formState.latitude,
                    }
                  : undefined
              }
              onMapReady={setIsMapReady}
              ref={mapRef}
            />
          </ErrorBoundary>
        </div>
      )}
      {!findOnMap && (
        <FormInput
          field={{
            label: 'Continent',
            name: 'continent',
            type: 'select',
            options: [
              { key: '', value: '', label: 'Select a continent' },
              ...continents.map((c) => ({
                key: c.slug,
                value: c.slug,
                label: c.name,
              })),
            ],
          }}
          value={formState.continent}
          onChange={(e) => onLocationChange('continent', e.target.value)}
          errorMessage={errors.continent || ''}
          showLabel={!!formState.continent}
        />
      )}
      <div className="form-inline">
        {findOnMap ? (
          <>
            <FormInput
              field={{
                label: 'Country',
                name: 'country',
                type: 'text',
              }}
              value={
                isDeterminingLocation
                  ? 'Determining country...'
                  : countryName || ''
              }
              onChange={() => {}}
              errorMessage={!isDeterminingLocation ? errors.country : ''}
              showLabel={!!countryName}
              disabled
              readOnly
            />
            <FormInput
              field={{
                label: 'Region',
                name: 'region',
                type: 'text',
              }}
              value={
                isDeterminingLocation
                  ? 'Determining region...'
                  : regionName || ''
              }
              onChange={() => {}}
              errorMessage={!isDeterminingLocation ? errors.region : ''}
              showLabel={!!regionName}
              disabled
              readOnly
            />
          </>
        ) : (
          <>
            <FormInput
              field={{
                label: 'Country',
                name: 'country',
                type: 'select',
                options: [
                  {
                    key: '',
                    value: '',
                    label: 'Select a country',
                  },
                  ...filteredCountries.map((c) => ({
                    key: c.id,
                    value: c.id,
                    label: c.name,
                  })),
                ],
              }}
              value={formState.country || ''}
              onChange={(e) => onLocationChange('country', e.target.value)}
              errorMessage={errors.country || ''}
              showLabel={!!formState.country}
              disabled={!formState.continent}
            />
            <FormInput
              field={{
                label: 'Region',
                name: 'region',
                type: 'select',
                options: [
                  {
                    key: '',
                    value: '',
                    label: 'Select a region',
                  },
                  ...filteredRegions.map((r) => ({
                    key: r.id,
                    value: r.id,
                    label: r.name,
                  })),
                ],
              }}
              value={formState.region || ''}
              onChange={(e) => onLocationChange('region', e.target.value)}
              errorMessage={errors.region || ''}
              showLabel={!!formState.region}
              disabled={!formState.country}
            />
          </>
        )}
      </div>
      {/* Hidden inputs to ensure region, longitude, and latitude are always included in form submission */}
      <input type="hidden" name="region" value={formState.region || ''} />
      {findOnMap && formState.longitude !== undefined && (
        <input type="hidden" name="longitude" value={formState.longitude} />
      )}
      {findOnMap && formState.latitude !== undefined && (
        <input type="hidden" name="latitude" value={formState.latitude} />
      )}
      {regionNotFoundMessage && findOnMap && !formState.region && (
        <InfoMessage message={regionNotFoundMessage} />
      )}
      <div className="form-inline">
        <FormInput
          field={{
            label: 'Longitude',
            name: 'longitude',
            type: 'number',
          }}
          value={formState.longitude}
          onChange={(e) =>
            onLocationChange('longitude', parseFloat(e.target.value))
          }
          errorMessage={errors.longitude || ''}
          showLabel={!!formState.longitude}
          disabled={findOnMap}
          readOnly={findOnMap}
        />
        <FormInput
          field={{
            label: 'Latitude',
            name: 'latitude',
            type: 'number',
          }}
          value={formState.latitude}
          onChange={(e) =>
            onLocationChange('latitude', parseFloat(e.target.value))
          }
          errorMessage={errors.latitude || ''}
          showLabel={!!formState.latitude}
          disabled={findOnMap}
          readOnly={findOnMap}
        />
      </div>
    </>
  )
}
