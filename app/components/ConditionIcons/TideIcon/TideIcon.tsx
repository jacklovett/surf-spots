import { Tide } from '~/types/surfSpots'
import {
  CONDITION_CIRC_COORD,
  CONDITION_ICON_RADIUS,
  CONDITION_ICON_SIZE,
  getCommonStyles,
} from '../index'
import { TIDES } from './index'

interface TideIconProps {
  tide: Tide
  color?: string
}

const TideIcon = ({ tide, color = '#046380' }: TideIconProps) => {
  if (!tide) return null

  const tideValue = TIDES[tide]
  const commonIconStyles = getCommonStyles(color)

  const WAVE_SPACING = Math.floor(
    CONDITION_ICON_SIZE / (Object.keys(TIDES).length + 1),
  )

  const generateWaves = (tideValue: number) => {
    const waves = []
    for (let i = 0; i < tideValue; i++) {
      waves.push(
        <path
          key={i}
          d={`M0 ${
            CONDITION_ICON_SIZE - WAVE_SPACING - i * WAVE_SPACING
          }c2-2 5-2 7 0s5 2 7 0 5-2 7 0 5 2 7 0 5-2 7 0 5 2 7 0`}
        />,
      )
    }
    return waves
  }

  return (
    <svg {...commonIconStyles}>
      <defs>
        <clipPath id="clip-circle">
          <circle
            cx={CONDITION_CIRC_COORD}
            cy={CONDITION_CIRC_COORD}
            r={CONDITION_ICON_RADIUS}
          />
        </clipPath>
      </defs>
      <circle
        cx={CONDITION_CIRC_COORD}
        cy={CONDITION_CIRC_COORD}
        r={CONDITION_ICON_RADIUS}
      />
      <g clipPath="url(#clip-circle)">{generateWaves(tideValue)}</g>
    </svg>
  )
}

export default TideIcon
