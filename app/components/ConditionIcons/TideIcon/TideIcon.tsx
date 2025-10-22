import { Tide } from '~/types/surfSpots'
import {
  CONDITION_CIRC_COORD,
  CONDITION_ICON_RADIUS,
  CONDITION_ICON_SIZE,
  getCommonStyles,
} from '../index'
import { TIDE_WAVE_MAP, TIDES, TOTAL_TIDE_COUNT } from './index'

interface TideIconProps {
  tide: Tide
  color?: string
  size?: number
}

const generateWaves = (tideValue: number, color: string) => {
  const WAVE_SPACING = Math.floor(CONDITION_ICON_SIZE / (TOTAL_TIDE_COUNT + 1))

  return (TIDE_WAVE_MAP[tideValue] || []).map((i) => (
    <path
      key={i}
      d={`M0 ${
        CONDITION_ICON_SIZE - WAVE_SPACING - i * WAVE_SPACING
      }c2-2 5-2 7 0s5 2 7 0 5-2 7 0 5 2 7 0 5-2 7 0 5 2 7 0`}
      stroke={color}
      strokeWidth="2"
    />
  ))
}

const TideIcon = ({ tide, color = '#046380', size }: TideIconProps) => {
  if (!tide) return null

  const tideKey = Object.keys(Tide).find(
    (key) => Tide[key as keyof typeof Tide] === tide,
  )

  const tideValue = tideKey ? TIDES[tideKey] : null

  if (tideValue === null) {
    console.error(`Unknown tide value: ${tide}`)
    return
  }

  const commonIconStyles = getCommonStyles(color, size)

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
        stroke={color}
        strokeWidth={commonIconStyles.strokeWidth}
        fill="none"
      />
      <g clipPath="url(#clip-circle)">{generateWaves(tideValue, color)}</g>
    </svg>
  )
}

export default TideIcon
