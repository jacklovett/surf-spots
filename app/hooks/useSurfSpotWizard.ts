import { useState, useEffect } from 'react'
import type { SurfSpotFormState } from '~/types/surfSpots'
import {
  getStepRequiredFields,
  getSurfSpotStepValidators,
  type SurfSpotWizardStepId,
} from '~/utils/surfSpotWizardValidation'

export type WizardStepId = SurfSpotWizardStepId

export interface WizardStep {
  id: WizardStepId
  title: string
}

interface UseSurfSpotWizardParams {
  isNoveltyWave: boolean
  isPrivateSpot: boolean
  isWavepool: boolean
  formState: SurfSpotFormState
}

export const useSurfSpotWizard = ({
  isNoveltyWave,
  isPrivateSpot,
  isWavepool,
  formState,
}: UseSurfSpotWizardParams) => {
  const wizardSteps: readonly WizardStep[] = [
    { id: 'basics', title: 'Basics' },
    { id: 'location', title: 'Location' },
    { id: 'spot-type', title: 'Type' },
    ...(isNoveltyWave ? [] : [{ id: 'details' as const, title: 'Conditions' }]),
    { id: 'access', title: 'Amenities' },
    { id: 'rating', title: 'Rating' },
  ]

  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = wizardSteps.length
  const stepId = wizardSteps[currentStep]?.id

  useEffect(() => {
    if (currentStep >= totalSteps) {
      setCurrentStep(Math.max(0, totalSteps - 1))
    }
  }, [totalSteps, currentStep])

  const context = { isPrivateSpot, isWavepool, isNoveltyWave }
  const stepRequiredFields = getStepRequiredFields(stepId, context)
  const stepValidators = getSurfSpotStepValidators(context)

  const isCurrentStepValid = (): boolean => {
    if (stepRequiredFields.length === 0) return true
    for (const field of stepRequiredFields) {
      const value = formState[field as keyof SurfSpotFormState]
      const fn = stepValidators[field as keyof SurfSpotFormState]
      if (fn && fn(value)) return false
      if (!fn && (value === '' || value === undefined || value === null)) {
        return false
      }
    }
    return true
  }

  const canProceedToNext = isCurrentStepValid()

  const goNext = () => {
    if (!canProceedToNext) return
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1))
  }

  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 0))

  return {
    wizardSteps,
    currentStep,
    stepId,
    totalSteps,
    canProceedToNext,
    goNext,
    goBack,
  }
}
