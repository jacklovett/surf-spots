import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ContentStatus, ErrorBoundary, Loading, Menu } from '../index'

interface IProps {
  content: ReactNode
  showHeader?: boolean
  isAlternate?: boolean
  loading?: boolean
  error?: string | null
}

export const Page = (props: IProps) => {
  const { content, error, isAlternate = false, loading, showHeader } = props

  const navigate = useNavigate()

  const isLoggedIn = true // TODO: GET FROM Redux state

  const renderContent = () => {
    if (loading || error) {
      return (
        <>
          {loading && <ContentStatus content={<Loading />} />}
          {error && (
            <ContentStatus
              content={
                <>
                  <h4>Error</h4>
                  <p>{error}</p>
                </>
              }
              isError
            />
          )}
        </>
      )
    }

    return content
  }

  return (
    <div className={isAlternate ? 'page alternate' : 'page'}>
      {showHeader && (
        <header className="header space-between">
          <div className="center logo" onClick={() => navigate('/')}>
            <img src="/images/svg/logo.svg" alt="Logo" height="50" />
            <h2>Surf Spots</h2>
          </div>
          <div>{isLoggedIn && <Menu />}</div>
        </header>
      )}
      <div className="column content-container">
        <ErrorBoundary message="Unable to display page content">
          {renderContent()}
        </ErrorBoundary>
      </div>
      <footer className="footer">
        <p>© 2024 Surf Spots</p>
      </footer>
    </div>
  )
}
