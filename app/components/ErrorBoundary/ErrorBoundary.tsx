import { Component, ErrorInfo, ReactNode } from 'react'

interface IProps {
  children: ReactNode
  message?: string
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<IProps, ErrorBoundaryState> {
  constructor(props: IProps) {
    super(props)
    this.state = { hasError: false }
  }

  // Lifecycle method to update state on error
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  // Lifecycle method to log error
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    const { children, message } = this.props
    if (this.state.hasError) {
      return (
        <div className="center column">
          <h4>Error</h4>
          <p>{message ?? 'Oops! Something went wrong.'}</p>
        </div>
      )
    }

    return children
  }
}
