import { FormInput, DirectionSelector } from '~/components'
import { TIDE_OPTIONS, MONTH_LIST } from '~/types/formData'
import { Tide, SurfSpotFormState } from '~/types/surfSpots'
import { directionArrayToString } from '~/utils/surfSpotUtils'

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
  waveUnits: string
  onSwellDirectionChange: (directions: string[]) => void
  onWindDirectionChange: (directions: string[]) => void
  onChange: FormChangeHandler
}

export const BestConditionsSection = ({
  formState,
  errors,
  swellDirectionArray,
  windDirectionArray,
  waveUnits,
  onSwellDirectionChange,
  onWindDirectionChange,
  onChange,
}: BestConditionsSectionProps) => {
  return (
    <div className="pv">
      <h4 className="m-0 pt">Best Conditions</h4>
      <div className="form-inline">
        <div className="direction-selector-wrapper">
          <label className="form-label">Swell Direction</label>
          <p className="direction-selector-help">
            Click a direction, then click another to select a range
          </p>
          <DirectionSelector
            selected={swellDirectionArray}
            onChange={(directions) => {
              onSwellDirectionChange(directions)
              onChange('swellDirection', directionArrayToString(directions))
            }}
            formName="swellDirection"
          />
          {errors.swellDirection && (
            <p className="form-error">{errors.swellDirection}</p>
          )}
        </div>
        <div className="direction-selector-wrapper">
          <label className="form-label">Wind Direction</label>
          <p className="direction-selector-help">
            Click a direction, then click another to select a range
          </p>
          <DirectionSelector
            selected={windDirectionArray}
            onChange={(directions) => {
              onWindDirectionChange(directions)
              onChange('windDirection', directionArrayToString(directions))
            }}
            formName="windDirection"
          />
          {errors.windDirection && (
            <p className="form-error">{errors.windDirection}</p>
          )}
        </div>
      </div>
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
      />
      <div className="mv">
        <p className="m-0 pt bold">Ideal Surf Height</p>
        <div className="form-inline">
          <FormInput
            field={{
              label: `Min Surf Height (${waveUnits})`,
              name: 'minSurfHeight',
              type: 'number',
            }}
            value={formState.minSurfHeight}
            onChange={(e) => {
              const value = e.target.value
              onChange(
                'minSurfHeight',
                value === '' ? undefined : parseFloat(value),
              )
            }}
            errorMessage={errors.minSurfHeight || ''}
            showLabel={!!formState.minSurfHeight}
          />
          <FormInput
            field={{
              label: `Max Surf Height (${waveUnits})`,
              name: 'maxSurfHeight',
              type: 'number',
            }}
            value={formState.maxSurfHeight}
            onChange={(e) => {
              const value = e.target.value
              onChange(
                'maxSurfHeight',
                value === '' ? undefined : parseFloat(value),
              )
            }}
            errorMessage={errors.maxSurfHeight || ''}
            showLabel={!!formState.maxSurfHeight}
          />
        </div>
      </div>
    </div>
  )
}
