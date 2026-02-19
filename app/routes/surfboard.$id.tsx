import { useState, useEffect, RefObject } from 'react'
import {
  data,
  redirect,
  LoaderFunction,
  ActionFunction,
  useLoaderData,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router'
import {
  ContentStatus,
  Page,
  TextButton,
  MediaUpload,
  Modal,
  Button,
  Details,
  ErrorBoundary,
  MediaGallery,
} from '~/components'
import { requireSessionCookie } from '~/services/session.server'
import { cacheControlHeader, get, getDisplayMessage } from '~/services/networkService'
import { UPLOAD_ERROR_MEDIA_UNAVAILABLE } from '~/utils/errorUtils'
import { Surfboard, SurfboardMedia } from '~/types/surfboard'
import {
  addSurfboardMedia,
  deleteSurfboardMedia,
  deleteSurfboard,
} from '~/services/surfboard'
import { useUserContext, useToastContext } from '~/contexts'
import { useScrollReveal, useFileUpload, useActionFetcher } from '~/hooks'
import { formatLength, formatDimension } from '~/utils/surfboardUtils'
import { ActionData as BaseActionData } from '~/types/api'

interface LoaderData {
  surfboard: Surfboard
  error?: string
}

interface ActionData extends BaseActionData {
  media?: SurfboardMedia
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireSessionCookie(request)
  const userId = user?.id
  const surfboardId = params.id

  if (!surfboardId) {
    return data<LoaderData>(
      { error: 'Surfboard not found', surfboard: {} as Surfboard },
      { status: 404 },
    )
  }

  const cookie = request.headers.get('Cookie') ?? ''

  try {
    const surfboard = await get<Surfboard>(
      `surfboards/${surfboardId}?userId=${userId}`,
      {
        headers: { Cookie: cookie },
      },
    )
    return data<LoaderData>(
      { surfboard },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    console.error('Error fetching surfboard:', error)
    return data<LoaderData>(
      {
        error: `We couldn't load this surfboard right now. Please try again later.`,
        surfboard: {} as Surfboard,
      },
      { status: 500 },
    )
  }
}

const handleDeleteMedia = async (
  mediaId: string,
  userId: string,
  cookie: string,
): Promise<ReturnType<typeof data<ActionData>>> => {
  if (!mediaId) {
    return data<ActionData>(
      { error: 'Media ID is required' },
      { status: 400 },
    )
  }

  try {
    await deleteSurfboardMedia(mediaId, userId, {
      headers: { Cookie: cookie },
    })
    return data<ActionData>({ success: true })
  } catch (error) {
    console.error('[surfboard.$id action] Error deleting media:', error)
    return data<ActionData>(
      { error: getDisplayMessage(error, 'Failed to delete media. Please try again.') },
      { status: 500 },
    )
  }
}

const handleDeleteSurfboard = async (
  surfboardId: string,
  userId: string,
  cookie: string,
): Promise<ReturnType<typeof data<ActionData>> | ReturnType<typeof redirect>> => {
  try {
    await deleteSurfboard(surfboardId, userId, {
      headers: { Cookie: cookie },
    })
    return redirect('/surfboards')
  } catch (error) {
    console.error('[surfboard.$id action] Error deleting surfboard:', error)
    return data<ActionData>(
      { error: getDisplayMessage(error, 'Failed to delete surfboard. Please try again.') },
      { status: 500 },
    )
  }
}

export const action: ActionFunction = async ({ request, params }) => {
  try {
    const user = await requireSessionCookie(request)
    const surfboardId = params.id

    if (!surfboardId) {
      return data<ActionData>(
        { error: 'Surfboard ID is required' },
        { status: 400 },
      )
    }

    const formData = await request.formData()
    const intent = formData.get('intent') as string
    const cookie = request.headers.get('Cookie') || ''

    if (intent === 'record-media') {
      const s3Url = formData.get('s3Url') as string
      const mediaType = (formData.get('mediaType') as string) || 'image'
      if (!s3Url) {
        return data<ActionData>({ error: 'Missing s3Url' }, { status: 400 })
      }
      try {
        const media = await addSurfboardMedia(
          surfboardId,
          user.id,
          { originalUrl: s3Url, thumbUrl: s3Url, mediaType },
          { headers: { Cookie: cookie } },
        )
        return data<ActionData>({ success: true, media })
      } catch (err) {
        console.error('[surfboard.$id action] record-media failed', { surfboardId, err })
        return data<ActionData>(
          { error: getDisplayMessage(err, UPLOAD_ERROR_MEDIA_UNAVAILABLE) },
          { status: 500 },
        )
      }
    }

    if (intent === 'delete-media') {
      const mediaId = formData.get('mediaId') as string
      return await handleDeleteMedia(mediaId, user.id, cookie)
    }

    if (intent === 'delete-surfboard') {
      return await handleDeleteSurfboard(surfboardId, user.id, cookie)
    }

    return data<ActionData>({ error: 'Invalid intent' }, { status: 400 })
  } catch (error) {
    if (error instanceof Response) {
      throw error
    }
    const e = error as Error
    console.error(
      '[surfboard.$id action] Unhandled error. message=' + (e.message ?? String(error)) + '\nStack:\n' + (e.stack ?? '(no stack)'),
    )
    return data<ActionData>(
      { error: getDisplayMessage(error, 'Something went wrong. Please try again.') },
      { status: 500 },
    )
  }
}

export default function SurfboardDetail() {
  const { surfboard: initialSurfboard, error } = useLoaderData<LoaderData>()
  const { user } = useUserContext()
  const { showSuccess, showError } = useToastContext()
  const navigate = useNavigate()

  const [surfboard, setSurfboard] = useState<Surfboard | undefined>(
    initialSurfboard,
  )
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const sectionsRef = useScrollReveal()
  const params = useParams()
  const location = useLocation()
  const surfboardId = params.id
  const {
    uploadFiles,
    isUploading,
    error: uploadError,
    clearError: clearUploadError,
    fetcherData,
  } = useFileUpload({
    directUpload:
      surfboardId && location.pathname
        ? {
            getUploadUrlApi: (mediaType: string) =>
              `/api/surfboard/${surfboardId}/upload-url?mediaType=${mediaType}`,
            recordActionUrl: location.pathname,
          }
        : undefined,
  })
  const { submitAction: submitMediaAction, fetcher: mediaActionFetcher } =
    useActionFetcher<ActionData>()
  const { submitAction: submitDeleteAction, fetcher: deleteActionFetcher } =
    useActionFetcher<ActionData>()

  useEffect(() => {
    if (initialSurfboard) {
      setSurfboard(initialSurfboard)
    }
  }, [initialSurfboard])

  useEffect(() => {
    if (fetcherData?.success && fetcherData?.media) {
      const newMedia = fetcherData.media as SurfboardMedia
      setSurfboard((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          media: [...(prev.media || []), newMedia],
        }
      })
      showSuccess('Media uploaded successfully!')
    }
  }, [fetcherData, showSuccess])

  useEffect(() => {
    if (uploadError) {
      showError(uploadError)
      clearUploadError()
    }
  }, [uploadError, showError, clearUploadError])

  useEffect(() => {
    if (mediaActionFetcher.data?.error) {
      showError(mediaActionFetcher.data.error)
    } else if (mediaActionFetcher.data?.success && mediaActionFetcher.state === 'idle') {
      showSuccess('Media deleted successfully!')
    }
  }, [mediaActionFetcher.data, mediaActionFetcher.state, showSuccess, showError])

  useEffect(() => {
    if (deleteActionFetcher.data?.error) {
      const errorMsg = deleteActionFetcher.data.error
      setDeleteError(errorMsg)
      showError(errorMsg)
      setShowDeleteConfirm(false)
    } else if (deleteActionFetcher.data?.success && deleteActionFetcher.state === 'idle') {
      navigate('/surfboards')
    }
  }, [deleteActionFetcher.data, deleteActionFetcher.state, navigate, showError])

  const handleFileUpload = (files: FileList) => {
    if (!user?.id || !surfboard?.id) return
    uploadFiles(files, 'add-media', 'media')
  }

  const handleDeleteConfirm = () => {
    if (!user?.id || !surfboard?.id) return
    submitDeleteAction('delete-surfboard', {})
  }

  if (error || !initialSurfboard?.id || !surfboard?.id) {
    return (
      <Page showHeader>
        <ContentStatus isError>
          <p>{error || 'Surfboard not found'}</p>
        </ContentStatus>
      </Page>
    )
  }

  return (
    <Page showHeader>
      <div className="info-page-content mv">
        <div ref={sectionsRef as RefObject<HTMLDivElement>}>
          <TextButton
            text="Back to Surfboards"
            onClick={() => navigate('/surfboards')}
            iconKey="chevron-left"
          />
          <div className="row space-between">
            <h1>{surfboard.name}</h1>
            <div className="spot-actions">
              <TextButton
                text="Edit"
                onClick={() => navigate(`/edit-surfboard/${surfboard.id}`)}
                iconKey="edit"
                filled
              />
              <TextButton
                text="Delete"
                onClick={() => setShowDeleteConfirm(true)}
                iconKey="bin"
                filled
                danger
              />
            </div>
          </div>

          {surfboard.description && (
            <p className="description">{surfboard.description}</p>
          )}

          <div className="surfboard-details-grid">
            <Details label="Type" value={surfboard.boardType || '-'} />
            <Details
              label="Length"
              value={surfboard.length ? formatLength(surfboard.length) : '-'}
            />
            <Details
              label="Width"
              value={
                surfboard.width ? `${formatDimension(surfboard.width)}"` : '-'
              }
            />
            <Details
              label="Thickness"
              value={
                surfboard.thickness
                  ? `${formatDimension(surfboard.thickness)}"`
                  : '-'
              }
            />
            <Details
              label="Volume"
              value={surfboard.volume ? `${surfboard.volume}L` : '-'}
            />
            <Details label="Fin Setup" value={surfboard.finSetup || '-'} />
          </div>

          {surfboard.modelUrl && (
            <p className="mb">
              <strong>Model:</strong>{' '}
              <a
                href={surfboard.modelUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Shaper/Shop
              </a>
            </p>
          )}

          <ErrorBoundary message="Unable to load media">
            <section className="animate-on-scroll">
              <h3>Media</h3>
              <MediaGallery
                items={
                  surfboard.media?.map((media) => ({
                    id: media.id,
                    url: media.originalUrl,
                    thumbUrl: media.thumbUrl,
                    mediaType: (media.mediaType || 'image') as 'image' | 'video',
                    alt: surfboard.name,
                  })) || []
                }
                canDelete={!!user?.id}
                onDelete={(item) => {
                  if (user?.id) {
                    submitMediaAction('delete-media', { mediaId: item.id })
                  }
                }}
                altText={surfboard.name}
              />

              <div className="media-upload-container">
                {isUploading && <p className="mb">Uploading media...</p>}
                {mediaActionFetcher.state === 'submitting' && (
                  <p className="mb">Deleting media...</p>
                )}
                <MediaUpload
                  onFilesSelected={handleFileUpload}
                  accept="image/*,video/*"
                  multiple
                  disabled={isUploading || mediaActionFetcher.state === 'submitting'}
                />
              </div>
            </section>
          </ErrorBoundary>
        </div>
      </div>

      {showDeleteConfirm && (
        <Modal onClose={() => setShowDeleteConfirm(false)}>
          <div className="delete-confirm-modal">
            <h2>Delete Surfboard</h2>
            <p>
              Are you sure you want to delete this surfboard? This action cannot
              be undone.
            </p>
            {deleteError && <p className="delete-error">{deleteError}</p>}
            <div className="modal-actions">
              <Button
                label="Delete"
                variant="danger"
                onClick={handleDeleteConfirm}
              />
              <Button
                label="Cancel"
                variant="cancel"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteError('')
                }}
              />
            </div>
          </div>
        </Modal>
      )}
    </Page>
  )
}
