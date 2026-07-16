import { Component, ReactNode } from 'react'

import ErrorRecoveryActions from '~/components/ErrorRecoveryActions'
import Icon from '../Icon'
import { ERROR_BOUNDARY_GENERIC } from '~/utils/errorUtils'

interface ErrorBoundaryProps {
  message?: string
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  retryLoading: boolean
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, retryLoading: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, retryLoading: false }
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('Error caught in ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback">
          <Icon iconKey="error" useAccentColor />
          <h4 className="mt">
            {this.props.message ?? ERROR_BOUNDARY_GENERIC}
          </h4>
          <ErrorRecoveryActions
            onRetry={() => {
              this.setState({ retryLoading: true })
              this.setState({
                hasError: false,
                error: undefined,
                retryLoading: false,
              })
            }}
            retryLoading={this.state.retryLoading}
            secondaryAction={{
              label: 'Go home',
              onClick: () => {
                this.setState({ retryLoading: true })
                window.location.assign('/')
              },
            }}
          />
        </div>
      )
    }

    return this.props.children
  }
}
