import { ReactNode } from 'react'
import classNames from 'classnames'

import { ErrorBoundary } from '../index'
import ContentStatus from '../ContentStatus'
import { PageErrorRecoveryActions } from '../ErrorRecoveryActions'
import { ERROR_BOUNDARY_SECTION } from '~/utils/errorUtils'
import { COPYRIGHT_TEXT } from '../Footer'

interface IProps {
  children: ReactNode
  error?: string | null
  reversed?: boolean
}

/**
 * Auth layout never swaps children for a navigation loading shell.
 * That tree replace is a hydration footgun (SSR idle vs client loading)
 * and is why a failed OAuth redirect can look like "CSS died".
 */
export const AuthPage = (props: IProps) => {
  const { children, error, reversed } = props

  return (
    <main className="page">
      <ErrorBoundary message={ERROR_BOUNDARY_SECTION}>
        <div
          className={classNames({
            'auth-layout': true,
            reversed,
          })}
        >
          <div className="center column h-full flex-1">
            <div className="column center auth-content">
              {error ? (
                <ContentStatus isError actions={<PageErrorRecoveryActions />}>
                  <h1>Error</h1>
                  <p>{error}</p>
                </ContentStatus>
              ) : (
                children
              )}
            </div>
            <div className="auth-copyright">
              <p>{COPYRIGHT_TEXT}</p>
            </div>
          </div>
          <div className="flex-1 auth-hero">
            <img src="/images/png/logo.png" width="320" alt="Surf spots logo" />
          </div>
        </div>
      </ErrorBoundary>
    </main>
  )
}
