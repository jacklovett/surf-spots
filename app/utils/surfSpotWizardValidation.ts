import {
  validateRequired,
  validateLongitude,
  validateLatitude,
  validateDirection,
  validateUrl,
} from '~/hooks/useFormValidation'
import type { SurfSpotFormState } from '~/types/surfSpots'

export type SurfSpotWizardStepId =
  | 'basics'
  | 'location'
  | 'spot-type'
  | 'details'
  | 'access'
  | 'rating'

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
  const { isPrivateSpot, isWavepool } = context
  switch (stepId) {
    case 'basics':
      return isPrivateSpot ? ['name'] : ['name', 'description']
    case 'location':
      return ['continent', 'country', 'region', 'longitude', 'latitude']
    case 'spot-type':
      return isWavepool ? ['wavepoolUrl'] : []
    case 'details':
      // Private spots can omit detail fields; public spots require them.
      return isPrivateSpot ? [] : ['swellDirection', 'windDirection']
    case 'access':
    case 'rating':
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
  }
}
