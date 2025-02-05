import TideIcon from './TideIcon'
import { Tide } from '~/types/surfSpots'

export const TIDES: Record<Tide, number> = {
  Low: 1,
  'Low - Mid': 2,
  Mid: 3,
  'Mid - High': 4,
  High: 5,
}

export default TideIcon
