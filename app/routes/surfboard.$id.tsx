import { useState, useEffect, RefObject } from 'react'
import {
  data,
  LoaderFunction,
  ActionFunction,
  useLoaderData,
  useNavigation,
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
  deleteSurfboardImage,
  addSurfboardImage,
  deleteSurfboard,
} from '~/services/surfboard'
import { useUserContext } from '~/contexts'
import { useScrollReveal, useFileUpload } from '~/hooks'
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
      const cookie = request.headers.get('Cookie') || ''
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

  return data<ActionData>({ error: 'Invalid intent' }, { status: 400 })
}

export default function SurfboardDetail() {
  const loaderData = useLoaderData<LoaderData>()
  const navigation = useNavigation()
  const { surfboard: initialSurfboard, error } = loaderData || {
    surfboard: undefined,
    error: undefined,
  }
  const { user } = useUserContext()
  const navigate = useNavigate()

  const [surfboard, setSurfboard] = useState<Surfboard | undefined>(
    initialSurfboard,
  )
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const sectionsRef = useScrollReveal()

  const {
    uploadFiles,
    isUploading,
    error: uploadError,
    fetcherData,
  } = useFileUpload()

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
      setUploadSuccess(true)
      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000)
    }
  }, [fetcherData])

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

  const handleDeleteConfirm = async () => {
    if (!user?.id || !surfboard?.id) return

    try {
      await deleteSurfboard(surfboard.id, user.id)
      navigate('/surfboards')
    } catch (error) {
      console.error('Failed to delete surfboard:', error)
      setDeleteError(
        error instanceof Error
          ? error.message
          : 'Failed to delete surfboard. Please try again.',
      )
    }
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
                onDelete={async (item) => {
                  if (user?.id) {
                    try {
                      await deleteSurfboardImage(item.id, user.id)
                      setSurfboard((prev) =>
                        prev
                          ? {
                              ...prev,
                              images: prev.images?.filter(
                                (img) => img.id !== item.id,
                              ),
                            }
                          : prev,
                      )
                    } catch (error) {
                      console.error('Error deleting image:', error)
                      throw error
                    }
                  }
                }}
                altText={surfboard.name}
              />

              <div className="surfboard-media-upload">
                {uploadError && <p className="text-error mb">{uploadError}</p>}
                {uploadSuccess && (
                  <p className="mb" style={{ color: 'green' }}>
                    Image uploaded successfully!
                  </p>
                )}
                {isUploading && <p className="mb">Uploading image...</p>}
                <MediaUpload
                  onFilesSelected={handleFileUpload}
                  accept="image/*"
                  multiple
                  disabled={isUploading}
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
