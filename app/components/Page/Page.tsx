import { ReactNode } from 'react'
import { useNavigation } from '@remix-run/react'

import { ErrorBoundary, Header } from '../index'
import { renderContent } from './index'
import classNames from 'classnames'

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

  const { state } = useNavigation()

  const loading = state === 'loading' && !overrideLoading

  return (
    <>
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
      <footer
        className={classNames({
          alternate: isAlternate,
        })}
      >
        © 2025 Surf Spots
      </footer>
    </>
  )
}
