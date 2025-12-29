import { ReactNode, RefObject } from 'react'
import { Form, useFetcher, FetcherWithComponents } from 'react-router'
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
  fetcher?: FetcherWithComponents<any>
  action?: string
  hideSubmitButton?: boolean
  submitButtonClassName?: string
  formId?: string
  formRef?: RefObject<HTMLFormElement>
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
    fetcher: propFetcher,
    action,
    hideSubmitButton = false,
    submitButtonClassName,
  } = props

  const defaultFetcher = useFetcher()
  const fetcher = propFetcher ?? defaultFetcher
  const { isFormSubmitting } = useFormSubmission()
  const isSubmitting = propFetcher ? fetcher.state === 'submitting' : isFormSubmitting

  const FormElement = propFetcher ? fetcher.Form : Form
  const formProps = propFetcher && action 
    ? { method, noValidate: true, action, id: props.formId, ref: props.formRef } 
    : { method, noValidate: true, id: props.formId, ref: props.formRef }

  return (
    <ErrorBoundary>
      <FormElement {...formProps}>        
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
        {!hideSubmitButton && (
          <div className={submitButtonClassName || 'center-horizontal form-submit'}>
            <Button
              label={submitLabel || 'Submit'}
              type="submit"
              disabled={isDisabled || isSubmitting}
              loading={isSubmitting}
              aria-label={isSubmitting ? `${submitLabel || 'Submit'} - Processing` : submitLabel || 'Submit'}
            />
          </div>
        )}
        {onCancel && (
          <div className="mt">
            <Button
              label={cancelLabel ?? 'Cancel'}
              onClick={() => onCancel()}
              variant="cancel"
              disabled={isSubmitting}
            />
          </div>
        )}
      </FormElement>
    </ErrorBoundary>
  )
}

export default FormComponent
