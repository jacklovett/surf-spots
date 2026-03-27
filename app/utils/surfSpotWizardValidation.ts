import {
  validateRequired,
  validateLongitude,
  validateLatitude,
  validateDirection,
  validateUrl,
} from '~/hooks/useFormValidation'
import { SurfSpotStatus, type SurfSpotFormState } from '~/types/surfSpots'

export type SurfSpotWizardStepId =
  | 'basics'
  | 'location'
  | 'spot-type'
  | 'details'
  | 'access'

export interface SurfSpotWizardValidationContext {
  isPrivateSpot: boolean
  isWavepool: boolean
  isNoveltyWave: boolean
}

export const getStepRequiredFields = (
  stepId: SurfSpotWizardStepId | undefined,
  context: SurfSpotWizardValidationContext,
): (keyof SurfSpotFormState)[] => {
  if (!stepId) return []
  const { isPrivateSpot, isWavepool, isNoveltyWave } = context
  switch (stepId) {
    case 'basics':
      return isPrivateSpot ? ['name'] : ['name', 'description']
    case 'location':
      return ['continent', 'country', 'region', 'longitude', 'latitude']
    case 'spot-type':
      if (!isPrivateSpot) {
        const required: (keyof SurfSpotFormState)[] = [
          'type',
          'beachBottomType',
          'skillLevel',
          'waveDirection',
        ]
        if (isWavepool) {
          required.push('wavepoolUrl')
        }
        return required
      }
      return []
    case 'details':
      return isPrivateSpot || isNoveltyWave ? [] : ['swellDirection', 'windDirection']
    case 'access':
      return []
    default:
      return []
  }
}

type StepValidator = (value: unknown) => string

export const getSurfSpotStepValidators = (
  context: SurfSpotWizardValidationContext,
): Partial<Record<keyof SurfSpotFormState, StepValidator>> => {
  const { isPrivateSpot, isWavepool, isNoveltyWave } = context
  return {
    continent: (v) => validateRequired(v as string, 'Continent'),
    country: (v) => validateRequired(v as string, 'Country'),
    region: (v) => validateRequired(v as string, 'Region'),
    name: (v) => validateRequired(v as string, 'Name'),
    description: (v) =>
      isPrivateSpot ? '' : validateRequired(v as string, 'Description'),
    longitude: (v) => validateLongitude(v as number),
    latitude: (v) => validateLatitude(v as number),
    swellDirection: (v) => {
      if (isNoveltyWave) return ''
      // Public spots require swell direction; private spots may omit it.
      if (isPrivateSpot && (!v || (v as string).toString().trim() === '')) return ''
      const required = validateRequired(v as string, 'Swell Direction')
      return required || validateDirection(v as string, 'Swell Direction')
    },
    windDirection: (v) => {
      if (isNoveltyWave) return ''
      // Public spots require wind direction; private spots may omit it.
      if (isPrivateSpot && (!v || (v as string).toString().trim() === '')) return ''
      const required = validateRequired(v as string, 'Wind Direction')
      return required || validateDirection(v as string, 'Wind Direction')
    },
    wavepoolUrl: (v) =>
      !isWavepool
        ? ''
        : !v || (v as string).toString().trim() === ''
          ? 'Official website is required for wavepools'
          : validateUrl((v as string).toString(), 'Official Website'),
    type: (v) => {
      if (isPrivateSpot) return ''
      return validateRequired(v as string, 'Break type')
    },
    beachBottomType: (v) => {
      if (isPrivateSpot) return ''
      return validateRequired(v as string, 'Beach bottom type')
    },
    skillLevel: (v) => {
      if (isPrivateSpot) return ''
      return validateRequired(v as string, 'Skill level')
    },
    waveDirection: (v) => {
      if (isPrivateSpot) return ''
      return validateRequired(v as string, 'Wave direction')
    },
  }
}

export type SurfSpotPublicListingFields = {
  status: SurfSpotStatus
  description: string
  isWavepool: boolean
  isRiverWave: boolean
  wavepoolUrl?: string | null
  type?: string | null
  beachBottomType?: string | null
  skillLevel?: string | null
  waveDirection?: string | null
  swellDirection?: string | null
  windDirection?: string | null
}

const hasNonWhitespaceText = (value?: string | null): boolean =>
  value != null && String(value).trim() !== ''

export const isPublicSurfSpotPayloadComplete = (
  payload: SurfSpotPublicListingFields,
): boolean => {
  if (payload.isWavepool && payload.isRiverWave) {
    return false
  }
  if (payload.status === SurfSpotStatus.PRIVATE) {
    return true
  }
  if (!hasNonWhitespaceText(payload.description)) {
    return false
  }

  if (payload.isWavepool && !hasNonWhitespaceText(payload.wavepoolUrl)) {
    return false
  }

  return publicCoreConditionsAreComplete(payload)
}

const publicCoreConditionsAreComplete = (payload: SurfSpotPublicListingFields): boolean => {
  const hasCoreBreakFields =
    Boolean(payload.type) &&
    Boolean(payload.beachBottomType) &&
    Boolean(payload.skillLevel) &&
    Boolean(payload.waveDirection)

  if (!hasCoreBreakFields) {
    return false
  }

  const isNoveltyWave = payload.isWavepool || payload.isRiverWave
  if (isNoveltyWave) {
    return true
  }

  return hasNonWhitespaceText(payload.swellDirection) && hasNonWhitespaceText(payload.windDirection)
}

export const isPublicListingComplete = (wizard: {
  isPrivateSpot: boolean
  isWavepool: boolean
  isRiverWave: boolean
  wavepoolUrl: string
  formState: Pick<
    SurfSpotFormState,
    | 'description'
    | 'type'
    | 'beachBottomType'
    | 'skillLevel'
    | 'waveDirection'
    | 'swellDirection'
    | 'windDirection'
  >
}): boolean =>
  isPublicSurfSpotPayloadComplete({
    status: wizard.isPrivateSpot
      ? SurfSpotStatus.PRIVATE
      : SurfSpotStatus.PENDING,
    description: wizard.formState.description ?? '',
    isWavepool: wizard.isWavepool,
    isRiverWave: wizard.isRiverWave,
    wavepoolUrl: wizard.wavepoolUrl,
    type: wizard.formState.type,
    beachBottomType: wizard.formState.beachBottomType,
    skillLevel: wizard.formState.skillLevel,
    waveDirection: wizard.formState.waveDirection,
    swellDirection: wizard.formState.swellDirection,
    windDirection: wizard.formState.windDirection,
  })
