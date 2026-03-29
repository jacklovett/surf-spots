import { FormInput } from '~/components'
import {
  BREAK_TYPE_OPTIONS,
  BEACH_BOTTOM_OPTIONS,
  SKILL_LEVEL_OPTIONS,
  TYPICAL_CROWD_FORM_OPTIONS,
  WAVE_DIRECTION_OPTIONS,
} from '~/types/formData/surfSpots'
import {
  SurfSpotType,
  BeachBottomType,
  SkillLevel,
  WaveDirection,
  SurfSpotFormState,
} from '~/types/surfSpots'

type FormChangeHandler = <K extends keyof SurfSpotFormState>(
  field: K,
  value: SurfSpotFormState[K],
) => void

interface SpotDetailsSectionProps {
  formState: {
    type?: SurfSpotType
    beachBottomType?: BeachBottomType
    skillLevel?: SkillLevel
    waveDirection?: WaveDirection
    crowdLevel?: string
  }
  errors: {
    type?: string
    beachBottomType?: string
    skillLevel?: string
    waveDirection?: string
    crowdLevel?: string
  }
  onChange: FormChangeHandler
}

export const SpotDetailsSection = ({
  formState,
  errors,
  onChange,
}: SpotDetailsSectionProps) => {
  return (
    <>
      <div className="form-inline">
        <FormInput
          field={{
            label: 'Break Type',
            name: 'type',
            type: 'select',
            options: BREAK_TYPE_OPTIONS,
          }}
          onChange={(e) => onChange('type', e.target.value as SurfSpotType)}
          errorMessage={errors.type || ''}
          value={formState.type || ''}
          showLabel
        />
        <FormInput
          field={{
            label: 'Beach Bottom Type',
            name: 'beachBottomType',
            type: 'select',
            options: BEACH_BOTTOM_OPTIONS,
          }}
          onChange={(e) =>
            onChange('beachBottomType', e.target.value as BeachBottomType)
          }
          errorMessage={errors.beachBottomType || ''}
          value={formState.beachBottomType || ''}
          showLabel
        />
      </div>
      <FormInput
        field={{
          label: 'Skill Level',
          name: 'skillLevel',
          type: 'select',
          options: SKILL_LEVEL_OPTIONS,
        }}
        onChange={(e) => onChange('skillLevel', e.target.value as SkillLevel)}
        errorMessage={errors.skillLevel || ''}
        value={formState.skillLevel || ''}
        showLabel
      />
      <FormInput
        field={{
          label: 'Wave Direction',
          name: 'waveDirection',
          type: 'select',
          options: WAVE_DIRECTION_OPTIONS,
        }}
        onChange={(e) =>
          onChange('waveDirection', e.target.value as WaveDirection)
        }
        errorMessage={errors.waveDirection || ''}
        value={formState.waveDirection || ''}
        showLabel
      />
      <FormInput
        field={{
          label: 'Typical crowd',
          name: 'crowdLevel',
          type: 'select',
          options: TYPICAL_CROWD_FORM_OPTIONS,
        }}
        onChange={(e) => onChange('crowdLevel', e.target.value)}
        errorMessage={errors.crowdLevel || ''}
        value={formState.crowdLevel || ''}
        showLabel
      />
    </>
  )
}
