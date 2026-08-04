import { ReactNode } from 'react'
import classNames from 'classnames'

import {
  Drawer,
  ErrorBoundary,
  Footer,
  Header,
  LiveSessionBanner,
} from '../index'
import ContentStatus from '../ContentStatus'
import { PageErrorRecoveryActions } from '../ErrorRecoveryActions'
import { ERROR_BOUNDARY_SECTION } from '~/utils/errorUtils'

interface IProps {
  children: ReactNode
  showHeader?: boolean
  isAlternate?: boolean
  error?: string | null
}

export const Page = (props: IProps) => {
  const {
    children,
    error,
    isAlternate = false,
    showHeader,
  } = props

  return (
    <div className="page-wrapper">
      {showHeader && <Header />}
      {showHeader && <LiveSessionBanner />}
      <main
        className={classNames({
          page: true,
          alternate: isAlternate,
        })}
      >
        <section className="content-container">
          <ErrorBoundary message={ERROR_BOUNDARY_SECTION}>
            {error ? (
              <ContentStatus isError actions={<PageErrorRecoveryActions />}>
                <h1>Error</h1>
                <p>{error}</p>
              </ContentStatus>
            ) : (
              children
            )}
          </ErrorBoundary>
        </section>
      </main>
      <Footer isAlternate={isAlternate} />
      <Drawer />
    </div>
  )
}
