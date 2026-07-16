import ErrorRecoveryActions from './ErrorRecoveryActions'
import PageErrorRecoveryActions from './PageErrorRecoveryActions'

export type ErrorRecoverySecondaryAction = {
  label: string
  onClick: () => void
}

export { ErrorRecoveryActions, PageErrorRecoveryActions }

export default ErrorRecoveryActions
