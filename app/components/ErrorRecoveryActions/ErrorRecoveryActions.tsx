import Button from '../Button'

import type { ErrorRecoverySecondaryAction } from './index'

interface ErrorRecoveryActionsProps {
  onRetry: () => void
  retryLabel?: string
  retryLoading?: boolean
  secondaryAction?: ErrorRecoverySecondaryAction
}

/**
 * Composable recovery button row. No destinations baked in — callers pass them.
 */
export const ErrorRecoveryActions = ({
  onRetry,
  retryLabel = 'Try again',
  retryLoading = false,
  secondaryAction,
}: ErrorRecoveryActionsProps) => (
  <div className="error-recovery-actions">
    <Button
      label={retryLabel}
      type="button"
      loading={retryLoading}
      disabled={retryLoading}
      onClick={onRetry}
    />
    {secondaryAction && (
      <Button
        label={secondaryAction.label}
        type="button"
        variant="secondary"
        disabled={retryLoading}
        onClick={secondaryAction.onClick}
      />
    )}
  </div>
)

export default ErrorRecoveryActions
