import { FormEvent, ReactNode } from 'react'
import { Button } from '../index'

interface IProps {
  children: ReactNode
  onSubmit: (e: FormEvent) => void
  onReturn: () => void
  loading: boolean
  error: string | null
}

export const Form = (props: IProps) => {
  const { onSubmit, onReturn, loading, error, children } = props

  const isFormValid = () => {
    const formElement = document.querySelector('form') as HTMLFormElement
    return formElement?.checkValidity() ?? false
  }

  return (
    <form onSubmit={onSubmit} noValidate>
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
    </form>
  )
}

export default Form
