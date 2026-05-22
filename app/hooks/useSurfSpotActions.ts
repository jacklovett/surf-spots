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
  const pendingSubmitResolversRef = useRef<
    Array<(result: { success: boolean }) => void>
  >([])

  // Handle fetcher results: show toast and resolve pending Promise with success/error.
  useEffect(() => {
    if (fetcher.state !== 'idle') return

    const data = fetcher.data
    const hasError = data
      ? !!data.error || !!(data.hasError && data.submitStatus)
      : false

    if (pendingSubmitResolversRef.current.length > 0) {
      const pending = pendingSubmitResolversRef.current
      pendingSubmitResolversRef.current = []
      pending.forEach((resolve) => resolve({ success: !hasError }))
    }

    if (!data) return

    if (hasError) {
      const rawMessage = data.error || data.submitStatus
      showError(
        messageForDisplay(
          typeof rawMessage === 'string' ? rawMessage : undefined,
          DEFAULT_ERROR_MESSAGE,
        ),
      )
      return
    }
    if (data.success && data.surfSpotAction) {
      const successMessage = messageForSurfSpotActionSuccess(data.surfSpotAction)
      if (successMessage) {
        showSuccess(successMessage)
      }
    }
  }, [fetcher.data, fetcher.state, showError, showSuccess])

  const onFetcherSubmit = useCallback<SurfSpotQuickActionSubmitHandler>(
    (params) => {
      return new Promise<{ success: boolean }>((resolve) => {
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
          resolve({ success: false })
          showError(DEFAULT_ERROR_MESSAGE)
        }
      })
    },
    [fetcher, showError, pathname, actionRoute],
  )

  return { fetcher, onFetcherSubmit }
}
