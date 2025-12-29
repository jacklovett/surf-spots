import { DirectionSelector } from '~/components'
import { directionArrayToString } from '~/utils/surfSpotUtils'

interface DirectionSelectorsProps {
  swellDirectionArray: string[]
  windDirectionArray: string[]
  onSwellDirectionChange: (directions: string[]) => void
  onWindDirectionChange: (directions: string[]) => void
  swellFormName?: string
  windFormName?: string
  swellError?: string
  windError?: string
}

export const DirectionSelectors = ({
  swellDirectionArray,
  windDirectionArray,
  onSwellDirectionChange,
  onWindDirectionChange,
  swellFormName = 'swellDirection',
  windFormName = 'windDirection',
  swellError,
  windError,
}: DirectionSelectorsProps) => (
    <div className="form-inline">
      <div className="direction-selector-wrapper">
        <label className="form-label bold">Swell Direction</label>
        <p className="direction-selector-help">
          Click a direction, then click another to select a range
        </p>
        <DirectionSelector
          selected={swellDirectionArray}
          onChange={onSwellDirectionChange}
          formName={swellFormName}
        />
          <input
            type="hidden"
            name={swellFormName}
            value={directionArrayToString(swellDirectionArray)}
          />
        {swellError && <p className="form-error">{swellError}</p>}
      </div>
      <div className="direction-selector-wrapper">
        <label className="form-label bold">Wind Direction</label>
        <p className="direction-selector-help">
          Click a direction, then click another to select a range
        </p>
        <DirectionSelector
          selected={windDirectionArray}
          onChange={onWindDirectionChange}
          formName={windFormName}
        />
          <input
            type="hidden"
            name={windFormName}
            value={directionArrayToString(windDirectionArray)}
          />
        {windError && <p className="form-error">{windError}</p>}
      </div>
    </div>
  )
