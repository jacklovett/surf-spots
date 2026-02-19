/**
 * Returns a presigned S3 upload URL for trip media.
 * No file is sent to this route — the client uploads directly to S3.
 * Use this to avoid FUNCTION_PAYLOAD_TOO_LARGE on Vercel.
 */

import { data, LoaderFunction } from 'react-router'
import { requireSessionCookie } from '~/services/session.server'
import { getUploadUrl } from '~/services/trip'
import { getDisplayMessage } from '~/services/networkService'
import { UPLOAD_ERROR_MEDIA_UNAVAILABLE } from '~/utils/errorUtils'

interface LoaderData {
  uploadUrl: string
  mediaId: string
  error?: string
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireSessionCookie(request)
  const tripId = params.tripId
  if (!user?.id || !tripId) {
    return data<LoaderData>({ uploadUrl: '', mediaId: '' }, { status: 401 })
  }

  const url = new URL(request.url)
  const mediaType = url.searchParams.get('mediaType') ?? 'image'

  const cookie = request.headers.get('Cookie') ?? ''
  try {
    const result = await getUploadUrl(
      tripId,
      user.id,
      { mediaType },
      { headers: { Cookie: cookie } },
    )
    return data<LoaderData>({
      uploadUrl: result.uploadUrl,
      mediaId: result.mediaId,
    })
  } catch (error) {
    console.error('[api.trip.upload-url] getUploadUrl failed', { tripId, userId: user.id, error })
    return data<LoaderData>(
      { uploadUrl: '', mediaId: '', error: getDisplayMessage(error, UPLOAD_ERROR_MEDIA_UNAVAILABLE) },
      { status: 503 },
    )
  }
}
