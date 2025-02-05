import { SVGProps } from 'react'
import TideIcon from './TideIcon'
import DirectionIcon from './DirectionIcon'

export const CONDITION_ICON_SIZE = 42
export const CONDITION_ICON_STROKE_WIDTH = 2
export const CONDITION_ICON_RADIUS = 20
export const CONDITION_CIRC_COORD = CONDITION_ICON_RADIUS + 1

export const getCommonStyles = (color: string): SVGProps<SVGSVGElement> => ({
  width: CONDITION_ICON_SIZE,
  height: CONDITION_ICON_SIZE,
  fill: 'none',
  stroke: color,
  strokeWidth: CONDITION_ICON_STROKE_WIDTH,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: `0 0 ${CONDITION_ICON_SIZE} ${CONDITION_ICON_SIZE}`,
})

export { DirectionIcon, TideIcon }
