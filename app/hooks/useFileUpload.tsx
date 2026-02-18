import { useState, useEffect, useCallback } from 'react'
import { useFetcher } from 'react-router'
import { UPLOAD_ERROR_MEDIA_UNAVAILABLE } from '~/utils/errorUtils'

interface UseFileUploadOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

interface UseFileUploadReturn {
  uploadFiles: (files: FileList, intent: string, fieldName?: string) => void
  isUploading: boolean
  error: string | null
  clearError: () => void
  fetcherData:
    | { error?: string; success?: boolean; media?: unknown }
    | undefined
}

/**
 * Hook for handling file uploads via Remix actions
 * Handles the common pattern of submitting files using useFetcher
 */
export const useFileUpload = (
  options: UseFileUploadOptions = {},
): UseFileUploadReturn => {
  const fetcher = useFetcher<{ error?: string; success?: boolean }>()
  const [error, setError] = useState<string | null>(null)

  const { onSuccess, onError } = options

  // Handle errors and success from action.
  useEffect(() => {
    if (fetcher.state !== 'idle') return

    if (fetcher.data?.success && !fetcher.data?.error) {
      setError(null)
      onSuccess?.()
      return
    }

    if (fetcher.data?.error) {
      setError(fetcher.data.error)
      onError?.(fetcher.data.error)
      return
    }

    if (fetcher.data !== undefined) {
      setError(UPLOAD_ERROR_MEDIA_UNAVAILABLE)
      onError?.(UPLOAD_ERROR_MEDIA_UNAVAILABLE)
    }
  }, [fetcher.data, fetcher.state, onSuccess, onError])

  const uploadFiles = (
    files: FileList,
    intent: string,
    fieldName: string = 'media',
  ) => {
    // Upload each file using fetcher
    Array.from(files).forEach((file) => {
      const formData = new FormData()
      formData.append('intent', intent)
      formData.append(fieldName, file)

      fetcher.submit(formData, {
        method: 'post',
        encType: 'multipart/form-data',
      })
    })
  }

  const clearError = useCallback(() => setError(null), [])

  return {
    uploadFiles,
    isUploading: fetcher.state === 'submitting',
    error,
    clearError,
    fetcherData: fetcher.data,
  }
}
