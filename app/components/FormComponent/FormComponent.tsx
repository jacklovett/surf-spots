import { ReactNode } from 'react'
import { Form } from 'react-router';
import { Button, ErrorBoundary, Loading } from '../index'
import { SubmitStatus } from './index'

type FormMethod = 'post' | 'patch' | 'put'

interface IProps {
  children: ReactNode
  loading: boolean
  isDisabled: boolean
  method?: FormMethod
  submitLabel?: string
  submitStatus: SubmitStatus | null
}

export const FormComponent = (props: IProps) => {
  const {
    loading,
    children,
    isDisabled,
    method = 'post' as FormMethod,
    submitLabel,
    submitStatus,
  } = props

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
          {loading && <Loading />}
          {!loading && (
            <Button
              label={submitLabel || 'Submit'}
              type="submit"
              disabled={isDisabled}
            />
          )}
        </div>
      </Form>
    </ErrorBoundary>
  )
}

export default FormComponent
