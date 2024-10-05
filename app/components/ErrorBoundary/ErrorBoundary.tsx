import { Component, ReactNode } from 'react'

interface ErrorBoundaryProps {
  message?: string
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // You can log the error to an external service if needed
    console.error('Error caught in ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="center column">
          <h4>{this.props.message ?? 'Oops! Something went wrong.'}</h4>
          <p>{this.state.error?.message}</p>
        </div>
      )
    }

    // If no error, render children
    return this.props.children
  }
}
