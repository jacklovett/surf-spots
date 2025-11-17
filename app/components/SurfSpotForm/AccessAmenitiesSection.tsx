import {
  CheckboxOption,
  ChipSelector,
  FormInput,
  ForecastLinks,
} from '~/components'
import { Option } from '~/components/FormInput'
import {
  Availability,
  PARKING_OPTIONS,
  ACCOMMODATION_TYPES,
  FOOD_OPTIONS,
  FACILITIES,
  HAZARDS,
} from '~/types/formData'
import { SurfSpotFormState } from '~/types/surfSpots'
import { ForecastLink } from '../ForecastLinks'
import { kmToMiles } from '~/utils'

type FormChangeHandler = <K extends keyof SurfSpotFormState>(
  field: K,
  value: SurfSpotFormState[K],
) => void

interface AccessAmenitiesSectionProps {
  isBoatRequired: boolean
  onBoatRequiredChange: (value: boolean) => void
  accommodation: Availability
  onAccommodationChange: (value: Availability) => void
  food: Availability
  onFoodChange: (value: Availability) => void
  facilities: Option[]
  onFacilitiesChange: (value: Option[]) => void
  hazards: Option[]
  onHazardsChange: (value: Option[]) => void
  formState: {
    parking: string
    forecastLinks: ForecastLink[]
  }
  errors: {
    parking?: string
    forecastLinks?: string
  }
  distanceUnits: string
  onChange: FormChangeHandler
}

export const AccessAmenitiesSection = ({
  isBoatRequired,
  onBoatRequiredChange,
  accommodation,
  onAccommodationChange,
  food,
  onFoodChange,
  facilities,
  onFacilitiesChange,
  hazards,
  onHazardsChange,
  formState,
  errors,
  distanceUnits,
  onChange,
}: AccessAmenitiesSectionProps) => {
  return (
    <>
      <h4 className="mt pt">Access & Amenities</h4>
      {/* Access */}
      <div className="pv">
        {/* Parking */}
        {!isBoatRequired && (
          <FormInput
            field={{
              label: 'Parking',
              name: 'parking',
              type: 'select',
              options: PARKING_OPTIONS,
            }}
            value={formState.parking}
            onChange={(e) => onChange('parking', e.target.value)}
            errorMessage={errors.parking || ''}
            showLabel
          />
        )}
        <div className={!isBoatRequired ? 'mt' : ''}>
          <CheckboxOption
            name="boatRequired"
            title="Boat Required?"
            description="Is a boat required to access this surf spot?"
            checked={isBoatRequired}
            onChange={() => onBoatRequiredChange(!isBoatRequired)}
          />
        </div>
      </div>
      {/* Forecast Links */}
      <div className="pv">
        <h4 className="m-0 pt">Forecast Links</h4>
        <p className="mb">
          Add forecast sites you know for this surf spot. (Maximum of 3)
        </p>
        <ForecastLinks
          forecastLinks={formState.forecastLinks}
          onChange={(links) => onChange('forecastLinks', links)}
        />
      </div>
      {/* Amenities */}
      {/* Accommodation Nearby */}
      <div className="pv">
        <CheckboxOption
          name="accommodationNearby"
          title="Accommodation Nearby?"
          description={`Is there bookable accommodation available within ~${distanceUnits === 'mi' ? Math.round(kmToMiles(10)) : 10}${distanceUnits}?`}
          checked={accommodation.nearby}
          onChange={() =>
            onAccommodationChange({
              ...accommodation,
              nearby: !accommodation.nearby,
            })
          }
        />
        {accommodation.nearby && (
          <div className="mt">
            <ChipSelector
              name="accommodationOptions"
              options={ACCOMMODATION_TYPES}
              selected={accommodation.options}
              onChange={(selected) =>
                onAccommodationChange({ ...accommodation, options: selected })
              }
            />
          </div>
        )}
      </div>
      {/* Food Nearby */}
      <div className="pv">
        <CheckboxOption
          name="foodNearby"
          title="Food Nearby?"
          description="Is food available nearby?"
          checked={food.nearby}
          onChange={() =>
            onFoodChange({
              ...food,
              nearby: !food.nearby,
            })
          }
        />
        {food.nearby && (
          <div className="mt">
            <ChipSelector
              name="foodOptions"
              options={FOOD_OPTIONS}
              selected={food.options}
              onChange={(selected) =>
                onFoodChange({
                  ...food,
                  options: selected,
                })
              }
            />
          </div>
        )}
      </div>
      {/* Facilities */}
      <div className="pv">
        <p className="bold pb">Facilities</p>
        <ChipSelector
          name="facilities"
          options={FACILITIES}
          selected={facilities}
          onChange={(selected) => onFacilitiesChange(selected)}
        />
      </div>
      {/* Hazards */}
      <div className="pv">
        <p className="bold pb">Hazards</p>
        <ChipSelector
          name="hazards"
          options={HAZARDS}
          selected={hazards}
          onChange={(selected) => onHazardsChange(selected)}
        />
      </div>
    </>
  )
}
