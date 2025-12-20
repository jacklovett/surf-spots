import { ReactNode } from 'react'
import { Form } from 'react-router'
import { Button, ErrorBoundary } from '../index'
import { SubmitStatus } from './index'
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

  const { isFormSubmitting } = useFormSubmission()

  return (
    <ErrorBoundary>
      <Form method={method} noValidate>        
        {!!submitStatus && (
          <div className="form-status-container">
            {!submitStatus?.isError && (
              <span className="form-success">{submitStatus?.message}</span>
            )}
            {submitStatus?.isError && (
              <span className="form-error">{submitStatus.message}</span>
            )}
          </div>
        )}
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
