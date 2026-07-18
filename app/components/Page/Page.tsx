import { ReactNode } from 'react'
import { useNavigation, useLocation } from 'react-router'
import classNames from 'classnames'

import { Drawer, ErrorBoundary, Footer, Header, LiveSessionBanner } from '../index'
import { ERROR_BOUNDARY_SECTION } from '~/utils/errorUtils'
import { renderContent } from './renderContent'

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

  const loading =
    navigation.state === 'loading' &&
    (!navigation.location || navigation.location.pathname !== pathname) &&
    !overrideLoading

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
            {renderContent(children, loading, error)}
          </ErrorBoundary>
        </section>
      </main>
      <Footer isAlternate={isAlternate} />
      <Drawer />
    </div>
  )
}
