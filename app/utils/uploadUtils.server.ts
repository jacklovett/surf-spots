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
  UPLOAD_ERROR_GENERIC,
  UPLOAD_ERROR_MEDIA_UNAVAILABLE,
  UPLOAD_ERROR_NO_MEDIA_FILE,
} from '~/utils/errorUtils'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const DEFAULT_MIME_TYPE = 'application/octet-stream'

/** Allowed upload error messages (API/validation); anything else becomes UPLOAD_ERROR_GENERIC. */
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

  try {
    const { s3Url, mediaId } = await uploadToPresignedUrl(fileEntry, () =>
      options.getUploadUrl(mediaType),
    )
    const media = await options.recordMedia(s3Url, mediaId, mediaType)
    return { success: true, media }
  } catch (error) {
    console.error('[handleMediaUpload]', error)
    return { error: toSafeMessage(error, SAFE_UPLOAD_MESSAGES, UPLOAD_ERROR_GENERIC) }
  }
}
