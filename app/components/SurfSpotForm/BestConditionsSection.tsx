import { FormInput, DirectionSelectors } from '~/components'
import { TIDE_OPTIONS } from '~/types/formData/surfSpots'
import { Tide, SurfSpotFormState } from '~/types/surfSpots'
import { directionArrayToString } from '~/utils/surfSpotUtils'
import {
  convertSurfHeightToDisplay,
  convertSurfHeightToStored,
  getWaveUnits,
  type PreferredUnits,
} from '~/utils/unitUtils'

type FormChangeHandler = <K extends keyof SurfSpotFormState>(
  field: K,
  value: SurfSpotFormState[K],
) => void

interface BestConditionsSectionProps {
  formState: {
    swellDirection: string
    windDirection: string
    tide?: Tide
    minSurfHeight?: number
    maxSurfHeight?: number
  }
  errors: {
    swellDirection?: string
    windDirection?: string
    tide?: string
    minSurfHeight?: string
    maxSurfHeight?: string
  }
  swellDirectionArray: string[]
  windDirectionArray: string[]
  preferredUnits: PreferredUnits
  onSwellDirectionChange: (directions: string[]) => void
  onWindDirectionChange: (directions: string[]) => void
  onChange: FormChangeHandler
  /** When true, swell and wind direction are required (e.g. natural break, not wavepool) */
  swellWindRequired?: boolean
  /** When true, best tide is required (public ocean spots) */
  tideRequired?: boolean
}

const parseSurfHeightInput = (
  rawValue: string,
  preferredUnits: PreferredUnits,
): number | undefined => {
  if (rawValue === '') {
    return undefined
  }
  return convertSurfHeightToStored(parseFloat(rawValue), preferredUnits)
}

export const BestConditionsSection = ({
  formState,
  errors,
  swellDirectionArray,
  windDirectionArray,
  preferredUnits,
  onSwellDirectionChange,
  onWindDirectionChange,
  onChange,
  swellWindRequired = true,
  tideRequired = false,
}: BestConditionsSectionProps) => {
  const waveUnits = getWaveUnits(preferredUnits)
  const minSurfHeightDisplay = convertSurfHeightToDisplay(
    formState.minSurfHeight,
    preferredUnits,
  )
  const maxSurfHeightDisplay = convertSurfHeightToDisplay(
    formState.maxSurfHeight,
    preferredUnits,
  )

  return (
    <div>
      <h3>Best Conditions</h3>
      <DirectionSelectors
        swellDirectionArray={swellDirectionArray}
        windDirectionArray={windDirectionArray}
        onSwellDirectionChange={(directions: string[]) => {
          onSwellDirectionChange(directions)
          onChange('swellDirection', directionArrayToString(directions))
        }}
        onWindDirectionChange={(directions: string[]) => {
          onWindDirectionChange(directions)
          onChange('windDirection', directionArrayToString(directions))
        }}
        swellFormName="swellDirection"
        windFormName="windDirection"
        swellError={errors.swellDirection}
        windError={errors.windDirection}
        swellRequired={swellWindRequired}
        windRequired={swellWindRequired}
      />
      <FormInput
        field={{
          label: 'Tide',
          name: 'tide',
          type: 'select',
          options: TIDE_OPTIONS,
        }}
        onChange={(e) => onChange('tide', e.target.value as Tide)}
        errorMessage={errors.tide || ''}
        value={formState.tide || ''}
        showLabel
        required={tideRequired}
      />
      <>
        <p className="m-0 pt bold">Ideal Surf Height</p>
        <div className="form-inline no-top-padding">
          <FormInput
            field={{
              label: `Min Surf Height (${waveUnits})`,
              name: 'minSurfHeight',
              type: 'number',
            }}
            value={minSurfHeightDisplay ?? ''}
            onChange={(event) => {
              onChange(
                'minSurfHeight',
                parseSurfHeightInput(event.target.value, preferredUnits),
              )
            }}
            errorMessage={errors.minSurfHeight || ''}
            showLabel={minSurfHeightDisplay != null}
          />
          <FormInput
            field={{
              label: `Max Surf Height (${waveUnits})`,
              name: 'maxSurfHeight',
              type: 'number',
            }}
            value={maxSurfHeightDisplay ?? ''}
            onChange={(event) => {
              onChange(
                'maxSurfHeight',
                parseSurfHeightInput(event.target.value, preferredUnits),
              )
            }}
            errorMessage={errors.maxSurfHeight || ''}
            showLabel={maxSurfHeightDisplay != null}
          />
        </div>
      </>
    </div>
  )
}
