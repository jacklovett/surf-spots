import { useFetcher } from 'react-router'
import { useCallback } from 'react'

/**
 * Base interface for action data that includes error handling
 */
export interface BaseActionData {
  error?: string
  success?: boolean
}

/**
 * Reusable hook for submitting actions via fetcher
 * Provides a consistent API for all action submissions
 */
export const useActionFetcher = <T extends BaseActionData = BaseActionData>() => {
  const fetcher = useFetcher<T>()

  const submitAction = useCallback(
    (intent: string, data: Record<string, string | number> = {}) => {
      const formData = new FormData()
      formData.append('intent', intent)

      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value))
      })

      fetcher.submit(formData, { method: 'POST' })
    },
    [fetcher],
  )

  return {
    fetcher,
    submitAction,
    isSubmitting: fetcher.state === 'submitting',
    isIdle: fetcher.state === 'idle',
    data: fetcher.data,
    error: fetcher.data?.error,
  }
}

