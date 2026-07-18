import { ReactNode } from 'react'

import ContentStatus from '../ContentStatus'
import { PageErrorRecoveryActions } from '../ErrorRecoveryActions'
import Loading from '../Loading'

export const renderContent = (
  children: ReactNode,
  loading: boolean,
  error?: string | null,
) => {
  if (loading) {
    return (
      <div className="page-loading-state">
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <ContentStatus isError actions={<PageErrorRecoveryActions />}>
        <h1>Error</h1>
        <p>{error}</p>
      </ContentStatus>
    )
  }

  return children
}
