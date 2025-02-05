import {
  describeArc,
  DirectionIconKey,
  getMidDirection,
  SVG_ANGLE_OFFSET,
  parseDirectionRange,
} from './index'
import {
  CONDITION_CIRC_COORD,
  CONDITION_ICON_RADIUS,
  getCommonStyles,
} from '../index'
import { Direction } from '~/types/surfSpots'

interface DirectionIconProps {
  type: DirectionIconKey
  directionRange: Direction
  color?: string
}

const DirectionIcon = ({
  type,
  directionRange,
  color = '#046380',
}: DirectionIconProps) => {
  if (!directionRange) return null

  const commonIconStyles = getCommonStyles(color)

  const [start, end] = parseDirectionRange(directionRange)

  if (type === 'wind') {
    const midDirection = getMidDirection(start, end)
    return (
      <svg {...commonIconStyles}>
        <circle
          cx={CONDITION_CIRC_COORD}
          cy={CONDITION_CIRC_COORD}
          r={CONDITION_ICON_RADIUS}
        />
        <g
          transform={`translate(${CONDITION_CIRC_COORD}, ${CONDITION_CIRC_COORD}) rotate(${midDirection})`}
        >
          <path
            d="M0 8 V-6 M-3 -4 L0 -10 L3 -4" /* Arrow Tail + Head */
            fill={color}
            stroke={color}
          />
        </g>
      </svg>
    )
  }

  if (type === 'swell') {
    // Adjust angles for SVG coordinate system
    const startAngle = (start + SVG_ANGLE_OFFSET) % 360
    const endAngle = (end + SVG_ANGLE_OFFSET) % 360
    // Determine if we are filling an inverted range
    const isInvertedRange = startAngle < endAngle
    const fillPath = describeArc(
      CONDITION_CIRC_COORD,
      CONDITION_CIRC_COORD,
      CONDITION_ICON_RADIUS,
      endAngle,
      isInvertedRange ? startAngle + 360 : startAngle,
    )

    return (
      <svg {...commonIconStyles}>
        {[CONDITION_ICON_RADIUS, 14.25, 9.5, 4.75].map((radius, idx) => (
          <circle
            key={`circle-${idx}`}
            cx={CONDITION_CIRC_COORD}
            cy={CONDITION_CIRC_COORD}
            r={radius}
          />
        ))}
        <path d={fillPath} fill={color} />
      </svg>
    )
  }

  return null
}

export default DirectionIcon
