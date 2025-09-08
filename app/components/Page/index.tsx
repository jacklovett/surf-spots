import { ReactNode } from 'react'
import ContentStatus from '../ContentStatus'
import Loading from '../Loading'
import { Page } from './Page'

export const renderContent = (
  children: ReactNode,
  loading: boolean,
  error?: string | null,
) => {
  if (loading || error) {
    return (
      <>
        {loading && (
          <ContentStatus>
            <Loading />
          </ContentStatus>
        )}
        {error && (
          <ContentStatus isError>
            <h1>Error</h1>
            <p>{error}</p>
          </ContentStatus>
        )}
      </>
    )
  }

  return children
}

export default Page
