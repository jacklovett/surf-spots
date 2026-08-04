import { ReactNode, RefObject, FormEvent } from 'react'
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
  /** Class name on the `<form>` element. */
  formClassName?: string
  /** Class name on the cancel `Button` when `onCancel` is set. */
  cancelButtonClassName?: string
  /** When set, form uses this handler instead of native submit (e.g. submit built FormData via fetcher). */
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void
  /** Override when using custom onSubmit (e.g. fetcher.state === 'submitting'). */
  isSubmitting?: boolean
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
    formClassName,
    cancelButtonClassName,
    onSubmit: customOnSubmit,
    isSubmitting: isSubmittingOverride,
  } = props

  const defaultFetcher = useFetcher()
  const fetcher = propFetcher ?? defaultFetcher
  const { isSubmitting: isNavigationSubmitting } = useFormSubmission()
  const isSubmitting =
    isSubmittingOverride ??
    (propFetcher ? fetcher.state === 'submitting' : isNavigationSubmitting)

  const handleSubmit = customOnSubmit
    ? (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        customOnSubmit(e)
      }
    : undefined

  const FormElement = customOnSubmit ? 'form' : (propFetcher ? fetcher.Form : Form)
  const formProps = customOnSubmit
    ? {
        noValidate: true,
        onSubmit: handleSubmit,
        id: props.formId,
        ref: props.formRef,
        className: formClassName,
      }
    : {
        method,
        noValidate: true,
        ...(action ? { action } : {}),
        id: props.formId,
        ref: props.formRef,
        className: formClassName,
      }

  return (
    <ErrorBoundary>
      <FormElement {...formProps}>
        {submitStatus && (
          <div className="form-status-container" aria-live="polite">
            <span
              className={
                submitStatus.isError ? 'form-error' : 'form-success'
              }
            >
              {submitStatus.message}
            </span>
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
              type="button"
              label={cancelLabel ?? 'Cancel'}
              onClick={() => onCancel()}
              variant="cancel"
              disabled={isSubmitting}
              className={cancelButtonClassName}
            />
          </div>
        )}
      </FormElement>
    </ErrorBoundary>
  )
}

export default FormComponent
