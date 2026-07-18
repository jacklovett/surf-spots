import {
  AddSurfSpotMap,
  FormInput,
  InfoMessage,
  ViewSwitch,
  ErrorBoundary,
  UseMyLocationButton,
} from '~/components'
import { ERROR_BOUNDARY_MAP } from '~/utils/errorUtils'
import { roundCoordinate } from '~/utils/coordinateUtils'
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
}

export const LocationSection = ({
  findOnMap,
  onToggleView,
  formState,
  errors,
  continents,
  locationSelection,
  onLocationChange,
}: LocationSectionProps) => {
  const {
    filteredCountries,
    filteredRegions,
    isDeterminingLocation,
    isRequestingUserLocation,
    countryName,
    regionName,
    regionNotFoundMessage,
    isMapReady,
    mapRef,
    handleLocationUpdate,
    handleUseMyLocation,
    isAtUserLocation,
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
          <UseMyLocationButton
            onClick={handleUseMyLocation}
            disabled={!isMapReady || isAtUserLocation}
            isRequesting={isRequestingUserLocation}
          />
        )}
      </div>

      {findOnMap ? (
        <>
          <div className="find-spot-map">
            <ErrorBoundary message={ERROR_BOUNDARY_MAP}>
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
          <div className="form-inline">
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
          </div>
          {formState.longitude !== undefined && (
            <input
              type="hidden"
              name="longitude"
              value={formState.longitude}
            />
          )}
          {formState.latitude !== undefined && (
            <input type="hidden" name="latitude" value={formState.latitude} />
          )}
          {!!regionNotFoundMessage && !formState.region && (
            <InfoMessage message={regionNotFoundMessage} />
          )}
        </>
      ) : (
        <>
          <FormInput
            field={{
              label: 'Continent',
              name: 'continent',
              type: 'select',
              options: [
                { key: '', value: '', label: 'Select a continent' },
                ...continents.map((continentOption) => ({
                  key: continentOption.slug,
                  value: continentOption.slug,
                  label: continentOption.name,
                })),
              ],
            }}
            value={formState.continent}
            onChange={(event) =>
              onLocationChange('continent', event.target.value)
            }
            errorMessage={errors.continent || ''}
            showLabel={!!formState.continent}
            required
          />
          <div className="form-inline">
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
                  ...filteredCountries.map((countryOption) => ({
                    key: countryOption.id,
                    value: countryOption.id,
                    label: countryOption.name,
                  })),
                ],
              }}
              value={formState.country || ''}
              onChange={(event) =>
                onLocationChange('country', event.target.value)
              }
              errorMessage={errors.country || ''}
              showLabel={!!formState.country}
              disabled={!formState.continent}
              required
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
                  ...filteredRegions.map((regionOption) => ({
                    key: regionOption.id,
                    value: regionOption.id,
                    label: regionOption.name,
                  })),
                ],
              }}
              value={formState.region || ''}
              onChange={(event) =>
                onLocationChange('region', event.target.value)
              }
              errorMessage={errors.region || ''}
              showLabel={!!formState.region}
              disabled={!formState.country}
              required
            />
          </div>
        </>
      )}

      {/* Hidden region so map mode still submits the resolved id (disabled fields are omitted). */}
      <input type="hidden" name="region" value={formState.region || ''} />
      <div className="form-inline">
        <FormInput
          field={{
            label: 'Longitude',
            name: 'longitude',
            type: 'number',
          }}
          value={formState.longitude}
          onChange={(event) =>
            onLocationChange(
              'longitude',
              roundCoordinate(parseFloat(event.target.value)),
            )
          }
          errorMessage={errors.longitude || ''}
          showLabel={!!formState.longitude}
          disabled={findOnMap}
          readOnly={findOnMap}
          required
        />
        <FormInput
          field={{
            label: 'Latitude',
            name: 'latitude',
            type: 'number',
          }}
          value={formState.latitude}
          onChange={(event) =>
            onLocationChange(
              'latitude',
              roundCoordinate(parseFloat(event.target.value)),
            )
          }
          errorMessage={errors.latitude || ''}
          showLabel={!!formState.latitude}
          disabled={findOnMap}
          readOnly={findOnMap}
          required
        />
      </div>
    </>
  )
}
