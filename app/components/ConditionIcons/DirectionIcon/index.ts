import DirectionIcon from './DirectionIcon'
import { Direction } from '~/types/surfSpots'

export const SVG_ANGLE_OFFSET = 270 // Adjustment made for for SVG coordinate system

export type DirectionIconKey = 'wind' | 'swell'
export const DIRECTIONS: Record<Direction, number> = {
  N: 0,
  NE: 45,
  E: 90,
  SE: 135,
  S: 180,
  SW: 225,
  W: 270,
  NW: 315,
}

/**
 * Get the surrounding direction range
 * @param direction
 * @returns number[] - direction ranges numeric values
 */
const getSurroundingDirectionRange = (direction: Direction): number[] => {
  const directions = Object.keys(DIRECTIONS) as Direction[]
  const centerDirectionValue = directions.indexOf(direction)
  const startDirection =
    directions[
      (centerDirectionValue - 1 + directions.length) % directions.length
    ]
  const endDirection =
    directions[(centerDirectionValue + 1) % directions.length]
  return [DIRECTIONS[startDirection], DIRECTIONS[endDirection]]
}

/**
 * Parse the direction range string and return the start and end angle
 * @param directionRangeStr
 * @returns number[]
 */
export const parseDirectionRange = (directionRangeStr: string): number[] => {
  const [startDirection, endDirection] = directionRangeStr.split(
    '-',
  ) as Direction[]

  return !endDirection
    ? getSurroundingDirectionRange(startDirection)
    : [DIRECTIONS[startDirection], DIRECTIONS[endDirection]]
}

/**
 * Calculate the middle of the wind direction range
 * @param startAngle
 * @param endAngle
 * @returns The middle between the wind direction range
 */
export const getMidDirection = (startAngle: number, endAngle: number) =>
  startAngle > endAngle
    ? ((startAngle + endAngle + 360) / 2) % 360
    : (startAngle + endAngle) / 2

/**
 * Function to generate an arc path from startAngle to endAngle
 * @param cx
 * @param cy
 * @param radius
 * @param startAngle
 * @param endAngle
 * @returns
 */
export const describeArc = (
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) => {
  const start = polarToCartesian(cx, cy, radius, endAngle)
  const end = polarToCartesian(cx, cy, radius, startAngle)
  const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? '1' : '0'

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ')
}

/**
 * Convert polar coordinates to cartesian
 * @param cx
 * @param cy
 * @param radius
 * @param angleInDegrees
 * @returns
 */
export const polarToCartesian = (
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number,
) => {
  const angleInRadians = (angleInDegrees * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  }
}

export default DirectionIcon
