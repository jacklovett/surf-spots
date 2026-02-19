/**
 * useFileUpload — hook used on trip and surfboard pages to add photos/videos.
 *
 * Flow: 1) GET presigned URL from our API (no file sent). 2) PUT file to S3 from the browser.
 * 3) POST add-media (mediaId, s3Url, mediaType) to the page action so the backend records it.
 * Files never go through our server.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useFetcher } from 'react-router'
import { edit } from '~/services/networkService'
import {
  UPLOAD_ERROR_MEDIA_UNAVAILABLE,
  UPLOAD_ERROR_FILE_SIZE_EXCEEDED,
} from '~/utils/errorUtils'

const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024 // 500MB

type PresignedResult = { uploadUrl: string; mediaId: string } | { error: string }

const fetchPresignedUrl = async (apiUrl: string): Promise<PresignedResult> => {
  const response = await fetch(apiUrl, { credentials: 'include' })
  const parsedResponse = (await response.json()) as { uploadUrl?: string; mediaId?: string; error?: string }
  const fallbackErrorMessage =
    typeof parsedResponse?.error === 'string' && parsedResponse.error.trim()
      ? parsedResponse.error.trim()
      : UPLOAD_ERROR_MEDIA_UNAVAILABLE
  if (!response.ok) return { error: fallbackErrorMessage }
  if (!parsedResponse?.uploadUrl || !parsedResponse?.mediaId) return { error: fallbackErrorMessage }
  return { uploadUrl: parsedResponse.uploadUrl, mediaId: parsedResponse.mediaId }
}

const uploadFileToS3 = async (uploadUrl: string, file: File): Promise<void> => {
  await edit(uploadUrl, file, {
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
  })
}

export interface UseFileUploadDirectUploadOptions {
  getUploadUrlApi: (mediaType: string) => string
  recordActionUrl: string
}

interface UseFileUploadOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
  directUpload: UseFileUploadDirectUploadOptions
}

interface UseFileUploadReturn {
  uploadFiles: (files: FileList) => void
  isUploading: boolean
  error: string | null
  clearError: () => void
  fetcherData: { error?: string; success?: boolean; media?: unknown } | undefined
}

export const useFileUpload = (options: UseFileUploadOptions): UseFileUploadReturn => {
  const fetcher = useFetcher<{ error?: string; success?: boolean; media?: unknown }>()
  const [error, setError] = useState<string | null>(null)
  const [uploadInProgress, setUploadInProgress] = useState(false)
  const resolveWhenActionDone = useRef<(() => void) | null>(null)

  const { onSuccess, onError, directUpload } = options

  useEffect(() => {
    if (fetcher.state !== 'idle') return
    if (fetcher.data?.success && !fetcher.data?.error) {
      setError(null)
      onSuccess?.()
      resolveWhenActionDone.current?.()
      resolveWhenActionDone.current = null
      return
    }
    if (fetcher.data?.error) {
      setError(fetcher.data.error)
      onError?.(fetcher.data.error)
      resolveWhenActionDone.current?.()
      resolveWhenActionDone.current = null
      return
    }
    if (fetcher.data !== undefined && !fetcher.data?.success) {
      setError(UPLOAD_ERROR_MEDIA_UNAVAILABLE)
      onError?.(UPLOAD_ERROR_MEDIA_UNAVAILABLE)
      resolveWhenActionDone.current?.()
      resolveWhenActionDone.current = null
    }
  }, [fetcher.data, fetcher.state, onSuccess, onError])

  const uploadFiles = useCallback(
    (files: FileList) => {
      const fileList = Array.from(files)
      if (fileList.length === 0) return

      const run = async () => {
        setError(null)
        setUploadInProgress(true)
        for (const file of fileList) {
          if (file.size > MAX_FILE_SIZE_BYTES) {
            setError(UPLOAD_ERROR_FILE_SIZE_EXCEEDED)
            onError?.(UPLOAD_ERROR_FILE_SIZE_EXCEEDED)
            break
          }
          const mediaType = file.type.startsWith('image/') ? 'image' : 'video'
          try {
            const presigned = await fetchPresignedUrl(directUpload.getUploadUrlApi(mediaType))
            if ('error' in presigned) {
              setError(presigned.error)
              onError?.(presigned.error)
              break
            }
            await uploadFileToS3(presigned.uploadUrl, file)
            const s3Url = presigned.uploadUrl.split('?')[0]
            const formData = new FormData()
            formData.append('intent', 'add-media')
            formData.append('mediaId', presigned.mediaId)
            formData.append('s3Url', s3Url)
            formData.append('mediaType', mediaType)
            await new Promise<void>((resolve) => {
              resolveWhenActionDone.current = resolve
              fetcher.submit(formData, { method: 'POST', action: directUpload.recordActionUrl })
            })
            if (fetcher.data?.error) break
          } catch {
            setError(UPLOAD_ERROR_MEDIA_UNAVAILABLE)
            onError?.(UPLOAD_ERROR_MEDIA_UNAVAILABLE)
            break
          }
        }
        setUploadInProgress(false)
      }
      run()
    },
    [directUpload, fetcher, onError],
  )

  const clearError = useCallback(() => setError(null), [])

  return {
    uploadFiles,
    isUploading: uploadInProgress || fetcher.state === 'submitting',
    error,
    clearError,
    fetcherData: fetcher.data,
  }
}
