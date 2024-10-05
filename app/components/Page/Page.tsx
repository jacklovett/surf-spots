import { ReactNode } from 'react'
import { Link, useNavigate } from '@remix-run/react'

import { ContentStatus, ErrorBoundary, Loading, Menu } from '../index'

interface IProps {
  children: ReactNode
  showHeader?: boolean
  isAlternate?: boolean
  loading?: boolean
  error?: string | null
}

export const Page = (props: IProps) => {
  const { children, error, isAlternate = false, loading, showHeader } = props

  const navigate = useNavigate()

  const isLoggedIn = true // TODO: GET FROM user state

  const renderContent = () => {
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
              <>
                <h4>Error</h4>
                <p>{error}</p>
              </>
            </ContentStatus>
          )}
        </>
      )
    }

    return children
  }

  return (
    <main className={isAlternate ? 'page alternate' : 'page'}>
      {showHeader && (
        <header className="header space-between">
          <div className="center logo" onClick={() => navigate('/')}>
            {/* TODO: Replace logo (it contains the text still) */}
            <img src="/favicon.ico" alt="Logo" height="40" />
            <h2>Surf Spots</h2>
          </div>
          {isLoggedIn && <Menu />}
          {!isLoggedIn && (
            <div className="login-nav">
              <Link to="/auth">Login</Link>
              <Link to="/auth">Sign up</Link>
            </div>
          )}
        </header>
      )}
      <section className="column content-container">
        <ErrorBoundary message="Unable to display page content">
          {renderContent()}
        </ErrorBoundary>
      </section>
      <footer className="footer">
        <p>© 2024 Surf Spots</p>
      </footer>
    </main>
  )
}
