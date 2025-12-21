import { Option } from '~/components/FormInput'
import { BASE_SKILL_LEVEL_OPTIONS } from './surfSpots'

export const GENDER_OPTIONS: Option[] = [
  { key: '', value: '', label: 'Select gender' },
  {
    key: 'male',
    value: 'Male',
    label: 'Male',
  },
  {
    key: 'female',
    value: 'Female',
    label: 'Female',
  },
  {
    key: 'non-binary',
    value: 'Non-binary',
    label: 'Non-binary',
  },
  {
    key: 'prefer-not-to-say',
    value: 'Prefer not to say',
    label: 'Prefer not to say',
  },
]

// Skill level options for user profile (no ALL_LEVELS)
export const USER_SKILL_LEVEL_OPTIONS: Option[] = [
  { key: '', value: '', label: 'Select skill level' },
  ...BASE_SKILL_LEVEL_OPTIONS,
]

