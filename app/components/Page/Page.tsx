import { ReactNode } from 'react'
import { useNavigation, useLocation } from 'react-router'
import classNames from 'classnames'

import { Drawer, ErrorBoundary, Footer, Header } from '../index'
import { renderContent } from './index'

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

  const navigation = useNavigation()
  const { pathname } = useLocation()
  
  // Show loading when navigating to a different route (or initial load)
  const loading = 
    navigation.state === 'loading' && 
    (!navigation.location || navigation.location.pathname !== pathname) &&
    !overrideLoading

  return (
    <div className="page-wrapper">
      {showHeader && <Header />}
      <main
        className={classNames({
          page: true,
          alternate: isAlternate,
        })}
      >
        <section className="content-container">
          <ErrorBoundary message="Unable to display page content">
            {renderContent(children, loading, error)}
          </ErrorBoundary>
        </section>
      </main>
      <Footer isAlternate={isAlternate} />
      <Drawer />
    </div>
  )
}
