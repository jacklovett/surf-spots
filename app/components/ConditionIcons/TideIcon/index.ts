import TideIcon from './TideIcon'
import { Tide } from '~/types/surfSpots'

export const TOTAL_TIDE_COUNT = 5 // Total number of possible waves

export const TIDE_WAVE_MAP: Record<number, number[]> = {
  0: [0, 1, 2, 3, 4], // Any - Show all waves
  1: [0, 1], // Low - Show bottom 2 waves
  2: [0, 1, 2], // Low-Mid - Show bottom 3 waves
  3: [1, 2, 3], // Mid - Show middle 3 waves
  4: [2, 3, 4], // Mid-High - Show top 3 waves
  5: [3, 4], // High - Show top 2 waves
}

export const TIDES: Record<Tide, number> = {
  Any: 0,
  Low: 1,
  'Low - Mid': 2,
  Mid: 3,
  'Mid - High': 4,
  High: 5,
}

export default TideIcon
