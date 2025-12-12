import { Option } from '~/components/FormInput'

export const BOARD_TYPE_OPTIONS: Option[] = [
  { key: '', value: '', label: 'Select board type' },
  { key: 'shortboard', value: 'shortboard', label: 'Shortboard' },
  { key: 'longboard', value: 'longboard', label: 'Longboard' },
  { key: 'fish', value: 'fish', label: 'Fish' },
  { key: 'mid-length', value: 'mid-length', label: 'Mid-Length' },
  { key: 'funboard', value: 'funboard', label: 'Funboard' },
  { key: 'gun', value: 'gun', label: 'Gun' },
  { key: 'hybrid', value: 'hybrid', label: 'Hybrid' },
  { key: 'soft-top', value: 'soft-top', label: 'Soft-Top' },
  { key: 'other', value: 'other', label: 'Other' },
]

export const FIN_SETUP_OPTIONS: Option[] = [
  { key: '', value: '', label: 'Select fin setup' },
  { key: 'single', value: 'single', label: 'Single' },
  { key: 'twin', value: 'twin', label: 'Twin' },
  { key: 'thruster', value: 'thruster', label: 'Thruster' },
  { key: 'quad', value: 'quad', label: 'Quad' },
  { key: '5-fin', value: '5-fin', label: '5-Fin' },
  { key: 'other', value: 'other', label: 'Other' },
]

export const STANDARD_BOARD_TYPES = [
  'shortboard',
  'longboard',
  'fish',
  'mid-length',
  'funboard',
  'gun',
  'hybrid',
  'soft-top',
]
