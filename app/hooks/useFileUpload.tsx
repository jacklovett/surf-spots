import { useState, useEffect, useCallback, useRef } from 'react'
import { useFetcher } from 'react-router'
import {
  UPLOAD_ERROR_MEDIA_UNAVAILABLE,
  UPLOAD_ERROR_FILE_SIZE_EXCEEDED,
} from '~/utils/errorUtils'

const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024 // 500MB (home videos, long clips)

export interface UseFileUploadDirectUploadOptions {
  /** Returns the URL to fetch for a presigned upload URL (e.g. /api/trip/123/upload-url?mediaType=image) */
  getUploadUrlApi: (mediaType: string) => string
  /** Action URL to submit record-media to (e.g. current route) */
  recordActionUrl: string
}

interface UseFileUploadOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
  /**
   * When set, files are uploaded directly to S3 (no file in request body),
   * avoiding FUNCTION_PAYLOAD_TOO_LARGE on Vercel.
   */
  directUpload?: UseFileUploadDirectUploadOptions
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
 * Hook for handling file uploads.
 * With directUpload options: gets presigned URL, uploads file to S3 from client, then records via action (avoids payload limits).
 * Without: submits file via fetcher (can hit Request Entity Too Large on Vercel).
 */
export const useFileUpload = (
  options: UseFileUploadOptions = {},
): UseFileUploadReturn => {
  const fetcher = useFetcher<{ error?: string; success?: boolean; media?: unknown }>()
  const [error, setError] = useState<string | null>(null)
  const [uploadInProgress, setUploadInProgress] = useState(false)
  const pendingRecordResolve = useRef<(() => void) | null>(null)

  const { onSuccess, onError, directUpload } = options

  // Handle errors and success from action (record-media or add-media).
  useEffect(() => {
    if (fetcher.state !== 'idle') return

    if (fetcher.data?.success && !fetcher.data?.error) {
      setError(null)
      onSuccess?.()
      pendingRecordResolve.current?.()
      pendingRecordResolve.current = null
      return
    }

    if (fetcher.data?.error) {
      setError(fetcher.data.error)
      onError?.(fetcher.data.error)
      pendingRecordResolve.current?.()
      pendingRecordResolve.current = null
      return
    }

    if (fetcher.data !== undefined && !fetcher.data?.success) {
      setError(UPLOAD_ERROR_MEDIA_UNAVAILABLE)
      onError?.(UPLOAD_ERROR_MEDIA_UNAVAILABLE)
      pendingRecordResolve.current?.()
      pendingRecordResolve.current = null
    }
  }, [fetcher.data, fetcher.state, onSuccess, onError])

  const uploadFiles = useCallback(
    (files: FileList, intent: string, fieldName: string = 'media') => {
      const fileList = Array.from(files)
      if (fileList.length === 0) return

      // Direct upload: file goes browser → S3 only. Nothing goes through Vercel, so no 4.5 MB limit.
      if (directUpload?.getUploadUrlApi && directUpload?.recordActionUrl) {
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
              const res = await fetch(directUpload.getUploadUrlApi(mediaType), {
                credentials: 'include',
              })
              if (!res.ok) {
                const text = await res.text()
                let errMsg = UPLOAD_ERROR_MEDIA_UNAVAILABLE
                try {
                  const json = JSON.parse(text) as { error?: string }
                  if (json?.error) errMsg = json.error
                } catch {
                  // use default
                }
                setError(errMsg)
                onError?.(errMsg)
                break
              }
              const json = (await res.json()) as {
                uploadUrl?: string
                mediaId?: string
                error?: string
              }
              if (json?.error || !json?.uploadUrl || !json?.mediaId) {
                setError(json?.error ?? UPLOAD_ERROR_MEDIA_UNAVAILABLE)
                onError?.(json?.error ?? UPLOAD_ERROR_MEDIA_UNAVAILABLE)
                break
              }
              const putRes = await fetch(json.uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                  'Content-Type': file.type || 'application/octet-stream',
                },
              })
              if (!putRes.ok) {
                setError(UPLOAD_ERROR_MEDIA_UNAVAILABLE)
                onError?.(UPLOAD_ERROR_MEDIA_UNAVAILABLE)
                break
              }
              const s3Url = json.uploadUrl.split('?')[0]
              const formData = new FormData()
              formData.append('intent', 'record-media')
              formData.append('mediaId', json.mediaId)
              formData.append('s3Url', s3Url)
              formData.append('mediaType', mediaType)
              await new Promise<void>((resolve) => {
                pendingRecordResolve.current = resolve
                fetcher.submit(formData, {
                  method: 'POST',
                  action: directUpload.recordActionUrl,
                })
              })
              if (fetcher.data?.error) break
            } catch (e) {
              setError(UPLOAD_ERROR_MEDIA_UNAVAILABLE)
              onError?.(UPLOAD_ERROR_MEDIA_UNAVAILABLE)
              break
            }
          }
          setUploadInProgress(false)
        }
        run()
        return
      }

      // Legacy path: sends file in request body. Vercel limit is 4.5 MB — anything over triggers 413.
      const vercelLimit = 4.5 * 1024 * 1024
      const tooLarge = fileList.find((f) => f.size > vercelLimit)
      if (tooLarge) {
        setError(
          'This file is too large for this upload method (over 4.5 MB). Refresh the page and try again, or use a file under 4.5 MB.',
        )
        onError?.('File too large. Refresh and try again or use a smaller file.')
        return
      }
      fileList.forEach((file) => {
        const formData = new FormData()
        formData.append('intent', intent)
        formData.append(fieldName, file)
        fetcher.submit(formData, {
          method: 'post',
          encType: 'multipart/form-data',
        })
      })
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
