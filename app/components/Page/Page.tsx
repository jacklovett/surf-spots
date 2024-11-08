import { ReactNode } from 'react'
import { useNavigate, useNavigation } from '@remix-run/react'

import { ContentStatus, ErrorBoundary, Header, Loading } from '../index'

interface IProps {
  children: ReactNode
  showHeader?: boolean
  isAlternate?: boolean
  error?: string | null
  overrideLoading?: boolean
}

export const Page = (props: IProps) => {
  const {
    children,
    error,
    isAlternate = false,
    showHeader,
    overrideLoading,
  } = props

  const navigate = useNavigate()
  const { state } = useNavigation()

  const loading = state === 'loading' && !overrideLoading

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
      {showHeader && <Header {...{ navigate }} />}
      <section className="content-container">
        <ErrorBoundary message="Unable to display page content">
          {renderContent()}
        </ErrorBoundary>
      </section>
      <footer className="footer mt">© 2024 Surf Spots</footer>
    </main>
  )
}
