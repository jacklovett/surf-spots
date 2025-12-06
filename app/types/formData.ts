import { Option } from '~/components/FormInput'
import {
  BeachBottomType,
  SkillLevel,
  SurfSpotType,
  Tide,
  WaveDirection,
} from './surfSpots'

const SELECT_OPTION: Option = { key: '', value: '', label: 'Select an option' }

export const MONTH_LIST: Option[] = [
  SELECT_OPTION,
  {
    key: 'January',
    value: 'January',
    label: 'January',
  },
  {
    key: 'February',
    value: 'February',
    label: 'February',
  },
  {
    key: 'March',
    value: 'March',
    label: 'March',
  },
  {
    key: 'April',
    value: 'April',
    label: 'April',
  },
  {
    key: 'May',
    value: 'May',
    label: 'May',
  },
  {
    key: 'June',
    value: 'June',
    label: 'June',
  },
  {
    key: 'July',
    value: 'July',
    label: 'July',
  },
  {
    key: 'August',
    value: 'August',
    label: 'August',
  },
  {
    key: 'September',
    value: 'September',
    label: 'September',
  },
  {
    key: 'October',
    value: 'October',
    label: 'October',
  },
  {
    key: 'November',
    value: 'November',
    label: 'November',
  },
  {
    key: 'December',
    value: 'December',
    label: 'December',
  },
]

export const BREAK_TYPE_OPTIONS = [
  SELECT_OPTION,
  {
    key: SurfSpotType.BEACH_BREAK,
    value: SurfSpotType.BEACH_BREAK,
    label: SurfSpotType.BEACH_BREAK,
  },
  {
    key: SurfSpotType.POINT_BREAK,
    value: SurfSpotType.POINT_BREAK,
    label: 'Point Break',
  },
  {
    key: SurfSpotType.REEF_BREAK,
    value: SurfSpotType.REEF_BREAK,
    label: 'Reef Break',
  },
]

export const BEACH_BOTTOM_OPTIONS = [
  SELECT_OPTION,
  {
    key: BeachBottomType.SAND,
    value: BeachBottomType.SAND,
    label: 'Sand',
  },
  {
    key: BeachBottomType.REEF,
    value: BeachBottomType.REEF,
    label: 'Reef',
  },
  {
    key: BeachBottomType.ROCK,
    value: BeachBottomType.ROCK,
    label: 'Rock',
  },
]

export const HAZARDS: Option[] = [
  { key: 'sharks', value: 'Sharks', label: 'Sharks' },
  { key: 'currents', value: 'Currents', label: 'Strong currents' },
  { key: 'rips', value: 'Rips', label: 'Rip Tides' },
  { key: 'rocks', value: 'Rocks', label: 'Rocks' },
  { key: 'reef', value: 'Reef', label: 'Reef' },
  { key: 'crocodiles', value: 'Crocodiles', label: 'Crocodiles' },
  { key: 'localism', value: 'Localism', label: 'Localism issues' },
]

export const ACCOMMODATION_TYPES: Option[] = [
  { key: 'hotel', value: 'Hotel', label: 'Hotel' },
  { key: 'hostel', value: 'Hostel', label: 'Hostel' },
  { key: 'campsite', value: 'Campsite', label: 'Campsite' },
  { key: 'guesthouse', value: 'Guesthouse', label: 'Guesthouse/Apartment' },
]

export type Availability = {
  nearby: boolean
  options: Option[]
}

export const FOOD_OPTIONS: Option[] = [
  {
    key: 'restaurant',
    value: 'Restaurant',
    label: 'Restaurant',
  },
  { key: 'cafe', value: 'Cafe', label: 'Café' },
  { key: 'pub', value: 'Pub', label: 'Pub' },
  {
    key: 'supermarket',
    value: 'Supermarket',
    label: 'Supermarket',
  },
]

export const SKILL_LEVEL_OPTIONS: Option[] = [
  SELECT_OPTION,
  {
    key: SkillLevel.BEGINNER,
    value: SkillLevel.BEGINNER,
    label: 'Beginner',
  },
  {
    key: SkillLevel.BEGINNER_INTERMEDIATE,
    value: SkillLevel.BEGINNER_INTERMEDIATE,
    label: 'Beginner - Intermediate',
  },
  {
    key: SkillLevel.INTERMEDIATE,
    value: SkillLevel.INTERMEDIATE,
    label: 'Intermediate',
  },
  {
    key: SkillLevel.INTERMEDIATE_ADVANCED,
    value: SkillLevel.INTERMEDIATE_ADVANCED,
    label: 'Intermediate - Advanced',
  },
  {
    key: SkillLevel.ADVANCED,
    value: SkillLevel.ADVANCED,
    label: 'Advanced',
  },
  {
    key: SkillLevel.ALL_LEVELS,
    value: SkillLevel.ALL_LEVELS,
    label: 'All Levels',
  },
]

export const TIDE_OPTIONS = [
  SELECT_OPTION,
  {
    key: Tide.ANY,
    value: Tide.ANY,
    label: 'Any',
  },
  {
    key: Tide.LOW,
    value: Tide.LOW,
    label: 'Low',
  },
  {
    key: Tide.LOW_MID,
    value: Tide.LOW_MID,
    label: 'Low - Mid',
  },
  {
    key: Tide.MID,
    value: Tide.MID,
    label: 'Mid',
  },
  {
    key: Tide.MID_HIGH,
    value: Tide.MID_HIGH,
    label: 'Mid - High',
  },
  {
    key: Tide.HIGH,
    value: Tide.HIGH,
    label: 'High',
  },
]

export const WAVE_DIRECTION_OPTIONS = [
  SELECT_OPTION,
  {
    key: WaveDirection.LEFT,
    value: WaveDirection.LEFT,
    label: 'Left',
  },
  {
    key: WaveDirection.RIGHT,
    value: WaveDirection.RIGHT,
    label: 'Right',
  },
  {
    key: WaveDirection.LEFT_AND_RIGHT,
    value: WaveDirection.LEFT_AND_RIGHT,
    label: 'Left and Right',
  },
]

export const PARKING_OPTIONS: Option[] = [
  SELECT_OPTION,
  { key: 'free', value: 'Free', label: 'Free' },
  { key: 'paid', value: 'Paid', label: 'Paid' },
  { key: 'street', value: 'Street', label: 'Street' },
  {
    key: 'none',
    value: 'None',
    label: 'No Parking Nearby',
  },
]

export const FACILITIES = [
  {
    key: 'wc',
    value: 'WC',
    label: 'Public WC',
  },
  {
    key: 'showers',
    value: 'Showers',
    label: 'Outdoor Showers',
  },
  {
    key: 'rentals',
    value: 'Rentals',
    label: 'Surf Rentals',
  },
  {
    key: 'surf shop',
    value: 'Surf Shop',
    label: 'Surf Shop',
  },
  {
    key: 'surf lessons',
    value: 'Surf Lessons',
    label: 'Surf Lessons',
  },
]

export const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Month options with 3-4 character abbreviations for filter chips
export const MONTH_OPTIONS: Option[] = [
  { key: 'January', value: 'January', label: 'Jan' },
  { key: 'February', value: 'February', label: 'Feb' },
  { key: 'March', value: 'March', label: 'Mar' },
  { key: 'April', value: 'April', label: 'Apr' },
  { key: 'May', value: 'May', label: 'May' },
  { key: 'June', value: 'June', label: 'Jun' },
  { key: 'July', value: 'July', label: 'Jul' },
  { key: 'August', value: 'August', label: 'Aug' },
  { key: 'September', value: 'September', label: 'Sep' },
  { key: 'October', value: 'October', label: 'Oct' },
  { key: 'November', value: 'November', label: 'Nov' },
  { key: 'December', value: 'December', label: 'Dec' },
]
