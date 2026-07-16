import { useState } from 'react'
import { useNavigate } from 'react-router'

import ErrorRecoveryActions from './ErrorRecoveryActions'

const reloadCurrentPage = () => {
  window.location.reload()
}

interface PageErrorRecoveryActionsProps {
  onRetry?: () => void
}

/**
 * Common page/loader recovery: reload (or custom retry) + Go home.
 * Use for full-page errors. Prefer ErrorRecoveryActions for in-context UI.
 */
const PageErrorRecoveryActions = ({
  onRetry = reloadCurrentPage,
}: PageErrorRecoveryActionsProps) => {
  const navigate = useNavigate()
  const [retryLoading, setRetryLoading] = useState(false)

  const handleRetry = () => {
    setRetryLoading(true)
    onRetry()
  }

  return (
    <ErrorRecoveryActions
      onRetry={handleRetry}
      retryLoading={retryLoading}
      secondaryAction={{
        label: 'Go home',
        onClick: () => navigate('/'),
      }}
    />
  )
}

export default PageErrorRecoveryActions