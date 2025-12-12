import { useState, useEffect } from 'react'
import { useFetcher } from 'react-router'

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
    | { error?: string; success?: boolean; image?: unknown; media?: unknown }
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

  // Handle errors from action
  useEffect(() => {
    if (fetcher.data?.error) {
      const errorMessage = fetcher.data.error
      setError(errorMessage)
      onError?.(errorMessage)
    } else if (
      fetcher.state === 'idle' &&
      fetcher.data?.success === true &&
      fetcher.data?.error === undefined
    ) {
      setError(null)
      onSuccess?.()
    }
  }, [fetcher.data, fetcher.state, onSuccess, onError])

  const uploadFiles = (
    files: FileList,
    intent: string,
    fieldName: string = 'image',
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

  const clearError = () => {
    setError(null)
  }

  return {
    uploadFiles,
    isUploading: fetcher.state === 'submitting',
    error,
    clearError,
    fetcherData: fetcher.data,
  }
}
