import { ReactNode } from 'react'
import { useNavigation } from '@remix-run/react'
import classNames from 'classnames'

import { ErrorBoundary } from '../index'
import { renderContent } from '../Page'

interface IProps {
  children: ReactNode
  error?: string | null
  reversed?: boolean
}

export const AuthPage = (props: IProps) => {
  const { children, error, reversed } = props

  const { state } = useNavigation()

  const loading = state === 'loading'

  return (
    <main className="page">
      <section>
        <ErrorBoundary message="Unable to display page content">
          <div
            className={classNames({
              'auth-layout': true,
              reversed,
            })}
          >
            <div className="center column flex-equal">
              <div className="column center auth-content">
                {renderContent(children, loading, error)}
                <footer className="footer">© 2025 Surf Spots</footer>
              </div>
            </div>
            <div className="flex-equal auth-hero">
              <img
                src="/images/png/logo.png"
                width="320"
                alt="Surf spots logo"
              />
            </div>
          </div>
        </ErrorBoundary>
      </section>
    </main>
  )
}
