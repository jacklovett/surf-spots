import { useState, useEffect, RefObject } from 'react'
import {
  data,
  redirect,
  LoaderFunction,
  ActionFunction,
  useLoaderData,
  useNavigate,
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
import { cacheControlHeader, get } from '~/services/networkService'
import { Surfboard, SurfboardImage } from '~/types/surfboard'
import {
  addSurfboardImage,
  deleteSurfboardImage,
  deleteSurfboard,
} from '~/services/surfboard'
import { useUserContext, useToastContext } from '~/contexts'
import { useScrollReveal, useFileUpload, useActionFetcher } from '~/hooks'
import { formatLength, formatDimension } from '~/utils/surfboardUtils'
import { fileToBase64 } from '~/utils/fileUtils.server'

interface LoaderData {
  surfboard: Surfboard
  error?: string
}

interface ActionData {
  error?: string
  success?: boolean
  image?: SurfboardImage
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

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireSessionCookie(request)
  if (!user?.id) {
    return data<ActionData>(
      { error: 'You must be logged in to upload images' },
      { status: 401 },
    )
  }

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

  // Handle image upload
  if (intent === 'add-image') {
    const fileEntry = formData.get('image')
    if (!fileEntry) {
      return data<ActionData>(
        { error: 'No image file provided' },
        { status: 400 },
      )
    }

    // FormData entries can be File or Blob in Node.js
    const isFile = fileEntry instanceof File
    const isBlob = fileEntry instanceof Blob

    if (!isFile && !isBlob) {
      return data<ActionData>(
        { error: 'Invalid file format. Please select a valid image file.' },
        { status: 400 },
      )
    }

    try {
      // Convert file to base64
      const base64Data = await fileToBase64(fileEntry)

      // Call API to add image
      const newImage = await addSurfboardImage(
        surfboardId,
        user.id,
        {
          originalUrl: base64Data,
          thumbUrl: base64Data,
        },
        { headers: { Cookie: cookie } },
      )

      // Return the new image so the UI can update optimistically
      return data<ActionData>({ success: true, image: newImage })
    } catch (error) {
      console.error('[surfboard.$id action] Error uploading image:', error)
      return data<ActionData>(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Failed to upload image. Please try again.',
        },
        { status: 500 },
      )
    }
  }

  // Handle delete image
  if (intent === 'delete-image') {
    const imageId = formData.get('imageId') as string
    if (!imageId) {
      return data<ActionData>(
        { error: 'Image ID is required' },
        { status: 400 },
      )
    }

    try {
      await deleteSurfboardImage(imageId, user.id, {
        headers: { Cookie: cookie },
      })
      return data<ActionData>({ success: true })
    } catch (error) {
      console.error('[surfboard.$id action] Error deleting image:', error)
      return data<ActionData>(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Failed to delete image. Please try again.',
        },
        { status: 500 },
      )
    }
  }

  // Handle delete surfboard
  if (intent === 'delete-surfboard') {
    try {
      await deleteSurfboard(surfboardId, user.id, {
        headers: { Cookie: cookie },
      })
      return redirect('/surfboards')
    } catch (error) {
      console.error('[surfboard.$id action] Error deleting surfboard:', error)
      return data<ActionData>(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Failed to delete surfboard. Please try again.',
        },
        { status: 500 },
      )
    }
  }

  return data<ActionData>({ error: 'Invalid intent' }, { status: 400 })
}

export default function SurfboardDetail() {
  const loaderData = useLoaderData<LoaderData>()
  const { surfboard: initialSurfboard, error } = loaderData || {
    surfboard: undefined,
    error: undefined,
  }
  const { user } = useUserContext()
  const { showSuccess, showError } = useToastContext()
  const navigate = useNavigate()

  const [surfboard, setSurfboard] = useState<Surfboard | undefined>(
    initialSurfboard,
  )
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const sectionsRef = useScrollReveal()

  const {
    uploadFiles,
    isUploading,
    error: uploadError,
    fetcherData,
  } = useFileUpload()

  const { submitAction: submitImageAction, fetcher: imageActionFetcher } =
    useActionFetcher<ActionData>()
  const { submitAction: submitDeleteAction, fetcher: deleteActionFetcher } =
    useActionFetcher<ActionData>()

  // Sync loader data to state when it changes
  useEffect(() => {
    if (initialSurfboard) {
      setSurfboard(initialSurfboard)
    }
  }, [initialSurfboard])

  // Handle successful image upload - optimistically update UI
  useEffect(() => {
    if (fetcherData?.success && fetcherData?.image) {
      const newImage = fetcherData.image as SurfboardImage
      setSurfboard((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          images: [...(prev.images || []), newImage],
        }
      })
      showSuccess('Image uploaded successfully!')
    }
  }, [fetcherData, showSuccess])

  // Handle upload errors
  useEffect(() => {
    if (uploadError) {
      showError(uploadError)
    }
  }, [uploadError, showError])

  // Handle image action responses (delete)
  useEffect(() => {
    if (imageActionFetcher.data?.error) {
      showError(imageActionFetcher.data.error)
    } else if (imageActionFetcher.data?.success && imageActionFetcher.state === 'idle') {
      // Image deleted successfully - Remix will automatically revalidate and update loader data
      showSuccess('Image deleted successfully!')
    }
  }, [imageActionFetcher.data, imageActionFetcher.state, showSuccess, showError])

  const handleFileUpload = (files: FileList) => {
    if (!user?.id || !surfboard?.id) return
    uploadFiles(files, 'add-image')
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

  // Handle delete surfboard response
  useEffect(() => {
    if (deleteActionFetcher.data?.error) {
      const errorMsg = deleteActionFetcher.data.error
      setDeleteError(errorMsg)
      showError(errorMsg)
      setShowDeleteConfirm(false)
    } else if (deleteActionFetcher.data?.success && deleteActionFetcher.state === 'idle') {
      // Surfboard deleted successfully - redirect to surfboards page
      navigate('/surfboards')
    }
  }, [deleteActionFetcher.data, deleteActionFetcher.state, navigate, showError])

  const handleDeleteConfirm = () => {
    if (!user?.id || !surfboard?.id) return
    submitDeleteAction('delete-surfboard', {})
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

          <ErrorBoundary message="Unable to load images">
            <section className="animate-on-scroll">
              <h3>Images</h3>
              <MediaGallery
                items={
                  surfboard.images?.map((img) => ({
                    id: img.id,
                    url: img.originalUrl,
                    thumbUrl: img.thumbUrl,
                    mediaType: 'image' as const,
                    alt: surfboard.name,
                  })) || []
                }
                canDelete={!!user?.id}
                onDelete={(item) => {
                  if (user?.id) {
                    // Submit delete action via fetcher - wait for server response
                    submitImageAction('delete-image', { imageId: item.id })
                  }
                }}
                altText={surfboard.name}
              />

              <div className="surfboard-media-upload">
                {isUploading && <p className="mb">Uploading image...</p>}
                {imageActionFetcher.state === 'submitting' && (
                  <p className="mb">Deleting image...</p>
                )}
                <MediaUpload
                  onFilesSelected={handleFileUpload}
                  accept="image/*"
                  multiple
                  disabled={isUploading || imageActionFetcher.state === 'submitting'}
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
