import { FormField, Option } from '~/components/FormInput'
import {
  CrowdLevel,
  CROWD_LEVEL_LABELS,
  SurfSessionWaveSize,
  SURF_SESSION_WAVE_QUALITY_LABELS,
  SURF_SESSION_WAVE_SIZE_LABELS,
  WaveQuality,
} from '~/types/surfSpots'
import { Surfboard } from '~/types/surfboard'
import { SELECT_OPTION, TIDE_OPTIONS } from './surfSpots'

const optionsForEnum = <T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
): Option[] =>
  values.map((value) => ({
    key: value,
    value,
    label: labels[value],
  }))

export const SURF_SESSION_TIDE_FIELD: FormField = {
  label: 'Tide when you surfed',
  name: 'tide',
  type: 'select',
  options: TIDE_OPTIONS,
}

export const SURF_SESSION_WAVE_SIZE_FIELD: FormField = {
  label: 'Wave size (rough height)',
  name: 'waveSize',
  type: 'select',
  options: [
    SELECT_OPTION,
    ...optionsForEnum(
      Object.values(SurfSessionWaveSize) as SurfSessionWaveSize[],
      SURF_SESSION_WAVE_SIZE_LABELS,
    ),
  ],
}

export const SURF_SESSION_CROWD_LEVEL_FIELD: FormField = {
  label: 'Lineup crowd',
  name: 'crowdLevel',
  type: 'select',
  options: [
    SELECT_OPTION,
    ...optionsForEnum(
      Object.values(CrowdLevel) as CrowdLevel[],
      CROWD_LEVEL_LABELS,
    ),
  ],
}

export const SURF_SESSION_WAVE_QUALITY_FIELD: FormField = {
  label: 'How it felt in the water',
  name: 'waveQuality',
  type: 'select',
  options: [
    SELECT_OPTION,
    ...optionsForEnum(
      Object.values(WaveQuality) as WaveQuality[],
      SURF_SESSION_WAVE_QUALITY_LABELS,
    ),
  ],
}

export const buildSurfSessionSurfboardField = (
  surfboards: Surfboard[],
): FormField => ({
  label: 'Surfboard',
  name: 'surfboardId',
  type: 'select',
  options: [
    { key: '', value: '', label: 'No board selected' },
    ...surfboards.map((b) => ({
      key: b.id,
      value: b.id,
      label: b.name,
    })),
  ],
})
