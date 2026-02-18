/**
 * Server-only: media upload flow (trip media, surfboard media).
 *
 * 1. Validate file (present, size)
 * 2. Get presigned URL from API
 * 3. Upload file to S3
 * 4. Record media in DB via API
 *
 * Used by trip.$id and surfboard.$id actions.
 */

import { edit } from '~/services/networkService'
import {
  toSafeMessage,
  UPLOAD_ERROR_FILE_SIZE_EXCEEDED,
  UPLOAD_ERROR_MEDIA_UNAVAILABLE,
  UPLOAD_ERROR_NO_MEDIA_FILE,
} from '~/utils/errorUtils'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const DEFAULT_MIME_TYPE = 'application/octet-stream'

/** API/validation messages we pass through to the user; any other error uses UPLOAD_ERROR_MEDIA_UNAVAILABLE. */
const SAFE_UPLOAD_MESSAGES = new Set([
  UPLOAD_ERROR_NO_MEDIA_FILE,
  UPLOAD_ERROR_FILE_SIZE_EXCEEDED,
  UPLOAD_ERROR_MEDIA_UNAVAILABLE,
])

/** Result from API presigned-URL endpoint. */
export interface PresignedUrlResult {
  uploadUrl: string
  mediaId: string
}

/** Result of uploading a file to S3 (URL + mediaId for recording). */
export interface S3UploadResult {
  s3Url: string
  mediaId: string
}

export interface MediaUploadOptions<T> {
  getUploadUrl: (mediaType: string) => Promise<PresignedUrlResult>
  recordMedia: (s3Url: string, mediaId: string, mediaType: string) => Promise<T>
}

const uploadToPresignedUrl = async (
  file: File | Blob,
  getUploadUrl: () => Promise<PresignedUrlResult>,
): Promise<S3UploadResult> => {
  const mimeType = file instanceof File ? file.type : DEFAULT_MIME_TYPE
  const { uploadUrl, mediaId } = await getUploadUrl()
  await edit(uploadUrl, file, {
    headers: { 'Content-Type': mimeType },
  })
  const s3Url = uploadUrl.split('?')[0]
  return { s3Url, mediaId }
}

// ——— Main API ———

/**
 * Validates file, uploads to S3, records via API. Returns { success, media } or { error }.
 */
export const handleMediaUpload = async <T>(
  fileEntry: FormDataEntryValue | null,
  options: MediaUploadOptions<T>,
): Promise<{ success: true; media: T } | { error: string }> => {
  if (!fileEntry || !(fileEntry instanceof Blob)) {
    return { error: UPLOAD_ERROR_NO_MEDIA_FILE }
  }

  if (fileEntry.size > MAX_FILE_SIZE_BYTES) {
    return { error: UPLOAD_ERROR_FILE_SIZE_EXCEEDED }
  }

  const mimeType = fileEntry instanceof File ? fileEntry.type : DEFAULT_MIME_TYPE
  const mediaType = mimeType.startsWith('image/') ? 'image' : 'video'

  let s3Url: string
  let mediaId: string
  try {
    const result = await uploadToPresignedUrl(fileEntry, () =>
      options.getUploadUrl(mediaType),
    )
    s3Url = result.s3Url
    mediaId = result.mediaId
  } catch (uploadError) {
    const err = uploadError as Error & { status?: number; responseSummary?: { status: number; statusText: string; contentType: string; reason: string } }
    const msg = err.message ?? String(err)
    const status = String(err.status ?? 'none')
    const summary = err.responseSummary
      ? `API returned HTTP ${err.responseSummary.status} (${err.responseSummary.statusText}) contentType=${err.responseSummary.contentType} reason=${err.responseSummary.reason}`
      : 'no responseSummary (likely network/fetch failure before API response)'
    const stack = err.stack ?? '(no stack)'
    const line =
      '[handleMediaUpload] FAILED at getUploadUrl or S3 upload. ' +
      'message=' + msg + ' HTTP_status=' + status + ' ' + summary + '\nStack:\n' + stack
    console.error(line)
    return {
      error: toSafeMessage(
        uploadError,
        SAFE_UPLOAD_MESSAGES,
        UPLOAD_ERROR_MEDIA_UNAVAILABLE,
      ),
    }
  }

  try {
    const media = await options.recordMedia(s3Url, mediaId, mediaType)
    return { success: true, media }
  } catch (recordError) {
    const err = recordError as Error & { status?: number; responseSummary?: { status: number; statusText: string; contentType: string; reason: string } }
    const msg = err.message ?? String(err)
    const status = String(err.status ?? 'none')
    const summary = err.responseSummary
      ? `API returned HTTP ${err.responseSummary.status} (${err.responseSummary.statusText}) contentType=${err.responseSummary.contentType} reason=${err.responseSummary.reason}`
      : 'no responseSummary'
    const stack = err.stack ?? '(no stack)'
    const line =
      '[handleMediaUpload] FAILED at recordMedia. ' +
      'message=' + msg + ' HTTP_status=' + status + ' ' + summary + '\nStack:\n' + stack
    console.error(line)
    return {
      error: toSafeMessage(
        recordError,
        SAFE_UPLOAD_MESSAGES,
        UPLOAD_ERROR_MEDIA_UNAVAILABLE,
      ),
    }
  }
}
