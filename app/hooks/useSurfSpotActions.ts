import { useCallback, useEffect } from 'react'
import { useFetcher, useLocation } from 'react-router'
import { useToastContext } from '~/contexts'
import { submitFetcher } from '~/components/SurfSpotActions'
import { messageForDisplay, DEFAULT_ERROR_MESSAGE } from '~/utils/errorUtils'
import { FetcherSubmitParams } from '~/types/api'

interface FetcherData {
  error?: string
  submitStatus?: string
  hasError?: boolean
  success?: boolean
}

/**
 * Shared hook for handling surf spot actions (add/remove from watch list or surfed spots)
 * Provides fetcher setup, error handling, and onFetcherSubmit callback
 * 
 * @param actionRoute - Optional route to submit actions to. Defaults to current pathname
 * @returns onFetcherSubmit callback to pass to SurfMap and other components
 */
export const useSurfSpotActions = (actionRoute?: string) => {
  const { pathname } = useLocation()
  const { showError } = useToastContext()
  const fetcher = useFetcher<FetcherData>()

  // Handle fetcher errors - show toast messages
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      const data = fetcher.data
      if (data.error || (data.hasError && data.submitStatus)) {
        const rawMessage = data.error || data.submitStatus
        const errorMessage = messageForDisplay(
          rawMessage,
          DEFAULT_ERROR_MESSAGE,
        )
        showError(errorMessage)
      }
    }
  }, [fetcher.data, fetcher.state, showError])

  const onFetcherSubmit = useCallback(
    (params: FetcherSubmitParams) => {
      try {
        // Use provided actionRoute or default to current pathname
        const route = actionRoute || pathname
        submitFetcher(params, fetcher, route)
      } catch (error) {
        console.error('Error submitting fetcher:', error)
        showError('Failed to submit action. Please try again.')
      }
    },
    [fetcher, showError, pathname, actionRoute],
  )

  return { onFetcherSubmit }
}
