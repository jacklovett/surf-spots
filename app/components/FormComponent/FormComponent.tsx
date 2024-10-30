import { ReactNode } from 'react'
import { Form } from '@remix-run/react'
import { Button, ErrorBoundary, Loading } from '../index'

interface IProps {
  children: ReactNode
  loading: boolean
  isDisabled: boolean
  submitLabel?: string
  submitError?: string
}

export const FormComponent = (props: IProps) => {
  const { loading, children, isDisabled, submitLabel, submitError } = props

  return (
    <ErrorBoundary>
      <Form method="post" noValidate>
        {submitError && <span className="form-error">{submitError}</span>}
        {children}
        <div className="center-horizontal mt form-submit">
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
