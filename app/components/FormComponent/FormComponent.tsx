import { FormEvent, ReactNode } from 'react'
import { Form } from '@remix-run/react'
import { Button } from '../index'

interface IProps {
  children: ReactNode
  onSubmit: (e: FormEvent) => void
  onReturn: () => void
  loading: boolean
  error: string | null
}

// TODO: Use Remix Form component

export const FormComponent = (props: IProps) => {
  const { onSubmit, onReturn, loading, error, children } = props

  const isFormValid = () => {
    return false
    // const formElement = document.querySelector('form') as HTMLFormElement
    // return formElement?.checkValidity() ?? false
  }

  return (
    <Form onSubmit={onSubmit}>
      {children}
      {error && <p className="error">{error}</p>}
      <div className="center-horizontal actions">
        <Button
          type="button"
          label="Back"
          disabled={loading}
          onClick={onReturn}
          variant="secondary"
        />
        <Button
          label={loading ? 'Submitting...' : 'Submit'}
          type="submit"
          disabled={loading || !isFormValid()}
        />
      </div>
    </Form>
  )
}

export default FormComponent
