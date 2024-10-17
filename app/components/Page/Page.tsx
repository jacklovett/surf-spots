import { ReactNode } from 'react'
import { useNavigate } from '@remix-run/react'

import { ContentStatus, ErrorBoundary, Header, Loading, Menu } from '../index'

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
      {showHeader && <Header {...{ isLoggedIn, navigate }} />}
      <section className="content-container">
        <ErrorBoundary message="Unable to display page content">
          {renderContent()}
        </ErrorBoundary>
      </section>
      <footer className="footer">© 2024 Surf Spots</footer>
    </main>
  )
}
