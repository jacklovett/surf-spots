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
import { SELECT_OPTION } from './surfSpots'

const optionsForEnum = <T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
): Option[] =>
  values.map((value) => ({
    key: value,
    value,
    label: labels[value],
  }))

export const SESSION_FEEDBACK_WAVE_SIZE_FIELD: FormField = {
  label: 'How big were the waves?',
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

export const SESSION_FEEDBACK_CROWD_LEVEL_FIELD: FormField = {
  label: 'How crowded was the lineup?',
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

export const SESSION_FEEDBACK_WAVE_QUALITY_FIELD: FormField = {
  label: 'How were the waves?',
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

export const buildSessionFeedbackSurfboardField = (
  surfboards: Surfboard[],
): FormField => ({
  label: 'Board used (optional)',
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
