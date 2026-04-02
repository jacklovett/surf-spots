import {
  CheckboxOption,
  ChipSelector,
  FormInput,
  UrlLinkList,
} from '~/components'
import { Option } from '~/components/FormInput'
import { SurfSpotFormState } from '~/types/surfSpots'
import { UrlLinkItem } from '~/components/UrlLinkList'
import { kmToMiles } from '~/utils/unitUtils'
import {
  MAX_FORECASTS,
  MAX_WEBCAMS,
} from '~/constants/surfSpotLimits'
import {
  Availability,
  PARKING_OPTIONS,
  ACCOMMODATION_TYPES,
  FOOD_OPTIONS,
  FACILITIES,
  HAZARDS,
} from '~/types/formData/surfSpots'

type FormChangeHandler = <K extends keyof SurfSpotFormState>(
  field: K,
  value: SurfSpotFormState[K],
) => void

interface AccessAmenitiesSectionProps {
  /** When true, forecast and webcam links are hidden (not applicable to wavepools). */
  isWavepool: boolean
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
    forecastLinks: UrlLinkItem[]
    webcamLinks: UrlLinkItem[]
  }
  errors: {
    parking?: string
    forecastLinks?: string
    webcamLinks?: string
  }
  distanceUnits: string
  onChange: FormChangeHandler
}

export const AccessAmenitiesSection = ({
  isWavepool,
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
      <h3>Amenities & Access</h3>
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
      {/* Forecast and webcam links: ocean spots only (not applicable to wavepools). */}
      {!isWavepool && (
        <>
          <div className="pv">
            <p className='bold'>Forecast Links</p>
            <p className="mb">
              Add forecast sites you know for this surf spot. (Maximum of {MAX_FORECASTS})
            </p>
            <UrlLinkList
              links={formState.forecastLinks}
              onChange={(links) => onChange('forecastLinks', links)}
              inputName="forecasts"
              linkLabel="Forecast Link"
              addButtonText="Add Forecast Link"
              maxLinks={MAX_FORECASTS}
            />
          </div>
          <div className="pv">
            <p className='bold'>Webcam Links</p>
            <p className="mb">
              Add webcam links for live views of this surf spot. (Maximum of {MAX_WEBCAMS})
            </p>
            <UrlLinkList
              links={formState.webcamLinks}
              onChange={(links) => onChange('webcamLinks', links)}
              inputName="webcams"
              linkLabel="Webcam Link"
              addButtonText="Add Webcam Link"
              maxLinks={MAX_WEBCAMS}
            />
          </div>
        </>
      )}
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
                onFoodChange({ ...food, options: selected })
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
