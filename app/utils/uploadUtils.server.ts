import { edit } from '~/services/networkService'

/**
 * Server-only utility functions for file uploads using presigned URLs
 * These functions handle the standard flow: get presigned URL -> upload to S3 -> record in database
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const DEFAULT_MIME_TYPE = 'application/octet-stream'

export interface PresignedUrlResponse {
  uploadUrl: string
  mediaId: string
}

export interface UploadToS3Result {
  s3Url: string
  mediaId: string
}

/**
 * Uploads a file to S3 using a presigned URL and returns the S3 URL
 * This follows the standard pattern:
 * 1. Get presigned URL from API
 * 2. Upload file directly to S3
 * 3. Return the S3 URL and media ID
 */
export const uploadFileToS3 = async (
  file: File | Blob,
  getUploadUrlFn: () => Promise<PresignedUrlResponse>,
): Promise<UploadToS3Result> => {
  const mimeType = file instanceof File ? file.type : DEFAULT_MIME_TYPE
  const { uploadUrl, mediaId } = await getUploadUrlFn()

  await edit(uploadUrl, file, {
    headers: {
      'Content-Type': mimeType,
    },
  })

  // Extract S3 URL by removing query params from presigned URL
  const s3Url = uploadUrl.split('?')[0]

  return { s3Url, mediaId }
}

/**
 * Extracts user-friendly error messages from upload errors
 */
function getUploadErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Failed to upload file. Please try again.'
  }

  const message = error.message.toLowerCase()

  if (message.includes('503') || message.includes('service_unavailable')) {
    return 'The server is temporarily unavailable. Please try again in a moment.'
  }
  if (message.includes('timeout') || message.includes('504')) {
    return 'The upload is taking too long. Please try a smaller file or try again later.'
  }
  if (message.includes('403') || message.includes('forbidden')) {
    return 'You do not have permission to upload this file.'
  }
  if (message.includes('failed to upload to storage')) {
    return 'Failed to upload file to storage. Please try again.'
  }

  return error.message || 'Failed to upload file. Please try again.'
}

export interface MediaUploadOptions<T> {
  getUploadUrl: (mediaType: string) => Promise<PresignedUrlResponse>
  recordMedia: (s3Url: string, mediaId: string, mediaType: string) => Promise<T>
}

/**
 * Generic function to handle media upload flow:
 * 1. Validates file (type and size)
 * 2. Determines media type (image/video)
 * 3. Gets presigned URL
 * 4. Uploads to S3
 * 5. Records media in database
 *
 * @param fileEntry - File or Blob from FormData
 * @param options - Object containing getUploadUrl and recordMedia functions
 * @returns Object with success flag and media data
 */
export const handleMediaUpload = async <T>(
  fileEntry: FormDataEntryValue | null,
  options: MediaUploadOptions<T>,
): Promise<{ success: boolean; media: T } | { error: string }> => {
  if (!fileEntry || !(fileEntry instanceof Blob)) {
    return { error: 'No media file provided' }
  }

  if (fileEntry.size > MAX_FILE_SIZE) {
    return {
      error: 'File size exceeds 10MB limit. Please choose a smaller file.',
    }
  }

  try {
    const mimeType =
      fileEntry instanceof File ? fileEntry.type : DEFAULT_MIME_TYPE
    const mediaType = mimeType.startsWith('image/') ? 'image' : 'video'

    const { s3Url, mediaId } = await uploadFileToS3(fileEntry, () =>
      options.getUploadUrl(mediaType),
    )
    const media = await options.recordMedia(s3Url, mediaId, mediaType)

    return { success: true, media }
  } catch (error) {
    console.error('[handleMediaUpload] Error uploading media:', error)
    return { error: getUploadErrorMessage(error) }
  }
}
