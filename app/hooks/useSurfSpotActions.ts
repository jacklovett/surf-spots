import { useCallback, useEffect, useRef } from 'react'
import { useFetcher, useLocation } from 'react-router'
import { useToastContext } from '~/contexts'
import { submitFetcher } from '~/components/SurfSpotActions'
import { messageForDisplay, DEFAULT_ERROR_MESSAGE } from '~/utils/errorUtils'
import { messageForSurfSpotActionSuccess } from '~/utils/surfSpotActionMessages'
import {
  ActionData,
  SurfSpotQuickActionSubmitHandler,
} from '~/types/api'

/**
 * Shared hook for handling surf spot actions (add/remove from watch list or surfed spots)
 * Provides fetcher setup, error handling, and onFetcherSubmit callback
 * 
 * @param actionRoute - Optional route to submit actions to. Defaults to current pathname
 * @returns onFetcherSubmit callback to pass to SurfMap and other components
 */
export const useSurfSpotActions = (actionRoute?: string) => {
  const { pathname } = useLocation()
  const { showError, showSuccess } = useToastContext()
  const fetcher = useFetcher<ActionData>()
  const pendingSubmitResolversRef = useRef<Array<() => void>>([])

  // Handle fetcher results with mutually exclusive toast behavior.
  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return
    const data = fetcher.data
    const hasError = !!data.error || !!(data.hasError && data.submitStatus)
    if (hasError) {
      const rawMessage = data.error || data.submitStatus
      const errorMessage = messageForDisplay(
        typeof rawMessage === 'string' ? rawMessage : undefined,
        DEFAULT_ERROR_MESSAGE,
      )
      showError(errorMessage)
      return
    }
    if (data.success && data.surfSpotAction) {
      const successMessage = messageForSurfSpotActionSuccess(data.surfSpotAction)
      if (successMessage) {
        showSuccess(successMessage)
      }
    }
  }, [fetcher.data, fetcher.state, showError, showSuccess])

  useEffect(() => {
    if (fetcher.state !== 'idle' || pendingSubmitResolversRef.current.length === 0) {
      return
    }

    const pendingResolvers = pendingSubmitResolversRef.current
    pendingSubmitResolversRef.current = []
    pendingResolvers.forEach((resolve) => resolve())
  }, [fetcher.state])

  const onFetcherSubmit = useCallback<SurfSpotQuickActionSubmitHandler>(
    (params) => {
      return new Promise<void>((resolve) => {
        try {
          // Use provided actionRoute or default to current pathname
          const route = actionRoute || pathname
          pendingSubmitResolversRef.current.push(resolve)
          submitFetcher(params, fetcher, route)
        } catch (error) {
          console.error('Error submitting fetcher:', error)
          pendingSubmitResolversRef.current = pendingSubmitResolversRef.current.filter(
            (pendingResolve) => pendingResolve !== resolve,
          )
          resolve()
          showError(DEFAULT_ERROR_MESSAGE)
        }
      })
    },
    [fetcher, showError, pathname, actionRoute],
  )

  return { fetcher, onFetcherSubmit }
}
