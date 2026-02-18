/**
 * Returns a presigned S3 upload URL for surfboard media.
 * No file is sent to this route — the client uploads directly to S3.
 * Use this to avoid FUNCTION_PAYLOAD_TOO_LARGE on Vercel.
 */

import { data, LoaderFunction } from 'react-router'
import { requireSessionCookie } from '~/services/session.server'
import { getSurfboardMediaUploadUrl } from '~/services/surfboard'

interface LoaderData {
  uploadUrl: string
  mediaId: string
  error?: string
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireSessionCookie(request)
  const surfboardId = params.id
  if (!user?.id || !surfboardId) {
    return data<LoaderData>({ uploadUrl: '', mediaId: '' }, { status: 401 })
  }

  const url = new URL(request.url)
  const mediaType = url.searchParams.get('mediaType') ?? 'image'

  const cookie = request.headers.get('Cookie') ?? ''
  try {
    const result = await getSurfboardMediaUploadUrl(
      surfboardId,
      user.id,
      { mediaType },
      { headers: { Cookie: cookie } },
    )
    return data<LoaderData>({
      uploadUrl: result.uploadUrl,
      mediaId: result.mediaId,
    })
  } catch (error) {
    console.error('[api.surfboard.upload-url] getSurfboardMediaUploadUrl failed', {
      surfboardId,
      userId: user.id,
      error,
    })
    return data<LoaderData>(
      { uploadUrl: '', mediaId: '', error: 'Failed to get upload URL' },
      { status: 503 },
    )
  }
}
