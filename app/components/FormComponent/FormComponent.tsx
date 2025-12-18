import { ReactNode, useEffect, useRef } from 'react'
import { Form, useNavigation } from 'react-router'
import { Button, ErrorBoundary } from '../index'
import { SubmitStatus } from './index'
import { useToastContext } from '~/contexts'
import { useFormSubmission } from '~/hooks'

type FormMethod = 'post' | 'patch' | 'put'

interface IProps {
  children: ReactNode
  isDisabled: boolean
  method?: FormMethod
  submitLabel?: string
  submitStatus: SubmitStatus | null
  onCancel?: () => void
  cancelLabel?: string
}

export const FormComponent = (props: IProps) => {
  const {
    children,
    isDisabled,
    method = 'post' as FormMethod,
    submitLabel,
    submitStatus,
    onCancel,
    cancelLabel,
  } = props

  const { showSuccess, showError } = useToastContext()
  const { isFormSubmitting } = useFormSubmission()
  const navigation = useNavigation()
  const previousMessageRef = useRef<string | null>(null)

  // Clear previous message when form starts submitting (new submission)
  useEffect(() => {
    if (isFormSubmitting) {
      previousMessageRef.current = null
    }
  }, [isFormSubmitting])

  // Show toast only when navigation is 'idle' (everything complete, button spinner stopped)
  // This ensures users see the toast only after the button has finished spinning
  useEffect(() => {
    if (
      navigation.state === 'idle' &&
      submitStatus &&
      submitStatus.message &&
      previousMessageRef.current !== submitStatus.message
    ) {
      if (submitStatus.isError) {
        showError(submitStatus.message)
      } else {
        showSuccess(submitStatus.message)
      }
      previousMessageRef.current = submitStatus.message
    }
  }, [navigation.state, submitStatus, showSuccess, showError])

  return (
    <ErrorBoundary>
      <Form method={method} noValidate>
        {children}
        <div className="center-horizontal form-submit">
          <Button
            label={submitLabel || 'Submit'}
            type="submit"
            disabled={isDisabled || isFormSubmitting}
            loading={isFormSubmitting}
            aria-label={isFormSubmitting ? `${submitLabel || 'Submit'} - Processing` : submitLabel || 'Submit'}
          />
        </div>
        {onCancel && (
          <div className="mt">
            <Button
              label={cancelLabel ?? 'Cancel'}
              onClick={() => onCancel()}
              variant="cancel"
              disabled={isFormSubmitting}
            />
          </div>
        )}
      </Form>
    </ErrorBoundary>
  )
}

export default FormComponent
