import { Component } from 'react'

/**
 * Error boundary component to catch React errors and display fallback UI.
 * Prevents white screen of death on unexpected errors.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
          <div className="max-w-md text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              An unexpected error occurred. Please refresh the page and try again.
            </p>
            <details className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
              <summary className="cursor-pointer font-medium text-gray-700">Error details</summary>
              <pre className="mt-2 text-xs text-gray-600 overflow-auto whitespace-pre-wrap break-words">
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-medical-600 text-white rounded-lg font-medium hover:bg-medical-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
