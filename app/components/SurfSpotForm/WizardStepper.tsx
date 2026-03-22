import Icon from '~/components/Icon'
import type { WizardStep } from '~/hooks/useSurfSpotWizard'

interface WizardStepperProps {
  steps: readonly WizardStep[]
  currentStep: number
  /** When true, render the wizard as fully completed (used for success step). */
  isComplete?: boolean
}

export const WizardStepper = ({
  steps,
  currentStep,
  isComplete,
}: WizardStepperProps) => {
  const totalSteps = steps.length

  return (
    <nav
      className="surf-spot-wizard-stepper"
      aria-label="Form progress"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
    >
      <div className="surf-spot-wizard-stepper-nodes">
        {steps.flatMap((step, index) => {
          const isLast = index === steps.length - 1
          const isCompleted = isComplete ? index <= currentStep : index < currentStep
          const isCurrent = isComplete ? isLast : index === currentStep
          const node = (
            <span
              key={`${step.id}-node`}
              className="surf-spot-wizard-stepper-slot"
            >
              <span
                className={`surf-spot-wizard-stepper-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span className="surf-spot-wizard-stepper-node-circle bold">
                  {isCompleted ? (
                    <Icon iconKey="success" useCurrentColor />
                  ) : (
                    index + 1
                  )}
                </span>
                {(isCompleted || isCurrent) && (
                  <span className="surf-spot-wizard-stepper-node-label">
                    {isLast && isComplete ? 'Completed' : step.title}
                  </span>
                )}
              </span>
            </span>
          )
          const sep =
            index < steps.length - 1 ? (
              <span
                key={`${step.id}-sep`}
                className="surf-spot-wizard-stepper-sep"
              >
                <span className="surf-spot-wizard-stepper-sep-line" />
              </span>
            ) : null
          return sep ? [node, sep] : [node]
        })}
      </div>
    </nav>
  )
}
