import { useState, RefObject, useEffect } from 'react'
import {
  data,
  LoaderFunction,
  ActionFunction,
  useLoaderData,
  useNavigate,
  useNavigation,
} from 'react-router'
import {
  Button,
  Chip,
  ContentStatus,
  EmptyState,
  ErrorBoundary,
  MediaGallery,
  MediaUpload,
  Modal,
  Page,
  Rating,
  TextButton,
} from '~/components'
import { useUserContext } from '~/contexts'
import { requireSessionCookie } from '~/services/session.server'
import { cacheControlHeader, get, post } from '~/services/networkService'
import {
  deleteTrip,
  removeSpot,
  removeMember,
  cancelInvitation,
  deleteMedia,
  addSurfboard,
  removeSurfboard,
} from '~/services/trip'
import { getSurfboards } from '~/services/surfboard'
import { Surfboard } from '~/types/surfboard'
import { RecordMediaRequest, Trip, TripMedia } from '~/types/trip'
import { useScrollReveal, useFileUpload } from '~/hooks'
import { InfoModal } from '~/components/Modal'
import { fileToBase64 } from '~/utils/fileUtils.server'
import { formatDate } from '~/utils/dateUtils'

interface LoaderData {
  trip: Trip
  error?: string
}

interface ActionData {
  error?: string
  success?: boolean
  media?: TripMedia
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireSessionCookie(request)
  const userId = user?.id
  const tripId = params.id

  if (!tripId) {
    return data<LoaderData>(
      { error: 'Trip not found', trip: {} as Trip },
      { status: 404 },
    )
  }

  const cookie = request.headers.get('Cookie') ?? ''

  try {
    const trip = await get<Trip>(`trips/${tripId}?userId=${userId}`, {
      headers: { Cookie: cookie },
    })
    return data<LoaderData>(
      { trip },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    console.error('Error fetching trip:', error)
    return data<LoaderData>(
      {
        error: `We couldn't load this trip right now. Please try again later.`,
        trip: {} as Trip,
      },
      { status: 500 },
    )
  }
}

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireSessionCookie(request)
  if (!user?.id) {
    return data<ActionData>(
      { error: 'You must be logged in to upload media' },
      { status: 401 },
    )
  }

  const tripId = params.id
  if (!tripId) {
    return data<ActionData>({ error: 'Trip ID is required' }, { status: 400 })
  }

  const formData = await request.formData()
  const intent = formData.get('intent') as string

  // Handle media upload
  if (intent === 'add-media') {
    const fileEntry = formData.get('image')
    if (!fileEntry) {
      return data<ActionData>(
        { error: 'No media file provided' },
        { status: 400 },
      )
    }

    // FormData entries can be File or Blob in Node.js
    const isFile = fileEntry instanceof File
    const isBlob = fileEntry instanceof Blob

    if (!isFile && !isBlob) {
      return data<ActionData>(
        { error: 'Invalid file format. Please select a valid media file.' },
        { status: 400 },
      )
    }

    try {
      // Convert file to base64
      const base64Data = await fileToBase64(fileEntry)

      // Determine media type
      const mimeType = isFile ? fileEntry.type : 'application/octet-stream'
      const mediaType = mimeType.startsWith('image/') ? 'image' : 'video'

      // Generate a media ID
      const mediaId = `media-${Date.now()}-${Math.random().toString(36).substring(7)}`

      // Call API to record media
      const cookie = request.headers.get('Cookie') || ''
      await post<RecordMediaRequest, void>(
        `trips/${tripId}/media?userId=${user.id}`,
        {
          mediaId,
          url: base64Data,
          mediaType,
        },
        { headers: { Cookie: cookie } },
      )

      // Create TripMedia object for optimistic UI update
      const newMedia: TripMedia = {
        id: mediaId,
        url: base64Data,
        mediaType,
        ownerId: user.id,
        ownerName: user.name || 'Unknown',
        uploadedAt: new Date().toISOString(),
      }

      // Return the new media so the UI can update optimistically
      return data<ActionData>({ success: true, media: newMedia })
    } catch (error) {
      console.error('[trip.$id action] Error uploading media:', error)
      return data<ActionData>(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Failed to upload media. Please try again.',
        },
        { status: 500 },
      )
    }
  }

  return data<ActionData>({ error: 'Invalid intent' }, { status: 400 })
}

export default function TripDetail() {
  const loaderData = useLoaderData<LoaderData>()
  const navigation = useNavigation()
  const { trip: initialTrip, error } = loaderData || {
    trip: undefined,
    error: undefined,
  }
  const { user } = useUserContext()
  const navigate = useNavigate()

  // Use state for optimistic UI updates when removing members/spots/media
  const [trip, setTrip] = useState<Trip | undefined>(initialTrip)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [errorTitle, setErrorTitle] = useState<string | undefined>(undefined)
  const [showAddSurfboardModal, setShowAddSurfboardModal] = useState(false)
  const [allSurfboards, setAllSurfboards] = useState<Surfboard[]>([])
  const [addingSurfboardId, setAddingSurfboardId] = useState<string | null>(
    null,
  )
  const [removingSurfboardId, setRemovingSurfboardId] = useState<string | null>(
    null,
  )
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const sectionsRef = useScrollReveal()

  const {
    uploadFiles,
    isUploading,
    error: uploadError,
    fetcherData,
  } = useFileUpload()

  // Sync state with loader data when it changes (e.g., after navigation)
  useEffect(() => {
    if (initialTrip) {
      setTrip(initialTrip)
    }
  }, [initialTrip])

  // Handle successful media upload - optimistically update UI
  useEffect(() => {
    if (fetcherData?.success && fetcherData?.media) {
      const newMedia = fetcherData.media as TripMedia
      setTrip((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          media: [...(prev.media || []), newMedia],
        }
      })
      setUploadSuccess(true)
      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000)
    }
  }, [fetcherData])

  // Helper to extract error message
  const getErrorMessage = (error: unknown, defaultMessage: string): string => {
    return error instanceof Error ? error.message : defaultMessage
  }

  // Early returns for error states

  if (error || !initialTrip?.id || !trip?.id) {
    return (
      <Page showHeader>
        <ContentStatus isError>
          <p>{error || 'Trip not found'}</p>
        </ContentStatus>
      </Page>
    )
  }

  // At this point, trip is guaranteed to be defined with an id
  const currentTrip = trip as Trip

  const handleDeleteClick = () => {
    if (!user?.id) return
    setShowDeleteConfirm(true)
    setDeleteError('')
  }

  const handleDeleteConfirm = async () => {
    if (!user?.id) return

    try {
      await deleteTrip(currentTrip.id, user.id)
      navigate('/trips')
    } catch (error) {
      console.error('Failed to delete trip:', error)
      setDeleteError(
        getErrorMessage(error, 'Failed to delete trip. Please try again.'),
      )
    }
  }

  const showError = (message: string, title?: string) => {
    setErrorMessage(message)
    setErrorTitle(title)
    setShowErrorModal(true)
  }

  const isSurfboardInTrip = (surfboardId: string): boolean => {
    return (
      currentTrip.surfboards?.some((sb) => sb.surfboardId === surfboardId) ??
      false
    )
  }

  const getTripSurfboardId = (surfboardId: string): string | null => {
    const tripSurfboard = currentTrip.surfboards?.find(
      (sb) => sb.surfboardId === surfboardId,
    )
    return tripSurfboard?.id || null
  }

  const handleAddSurfboardClick = async () => {
    if (!user?.id) return
    try {
      const surfboards = await getSurfboards(user.id)
      setAllSurfboards(surfboards)
      setShowAddSurfboardModal(true)
    } catch (error) {
      console.error('Failed to fetch surfboards:', error)
      showError(
        getErrorMessage(error, 'Failed to load surfboards. Please try again.'),
      )
    }
  }

  const handleAddSurfboard = async (surfboardId: string) => {
    if (!user?.id) return

    setAddingSurfboardId(surfboardId)

    // Optimistic update
    const surfboard = allSurfboards.find((sb) => sb.id === surfboardId)
    if (surfboard) {
      setTrip((prev) =>
        prev
          ? {
              ...prev,
              surfboards: [
                ...(prev.surfboards || []),
                {
                  id: 'temp',
                  surfboardId: surfboard.id,
                  surfboardName: surfboard.name,
                  addedAt: new Date().toISOString(),
                },
              ],
            }
          : prev,
      )
    }

    try {
      await addSurfboard(currentTrip.id, surfboardId, user.id)
      // Fetch updated trip data without reloading
      const cookie = document.cookie
      const updatedTrip = await get<Trip>(
        `trips/${currentTrip.id}?userId=${user.id}`,
        {
          headers: { Cookie: cookie },
        },
      )
      setTrip(updatedTrip)
    } catch (error) {
      console.error('Failed to add surfboard:', error)
      // Rollback optimistic update
      setTrip((prev) =>
        prev
          ? {
              ...prev,
              surfboards: prev.surfboards?.filter(
                (sb) => sb.surfboardId !== surfboardId,
              ),
            }
          : prev,
      )
      showError(
        getErrorMessage(error, 'Failed to add surfboard. Please try again.'),
      )
    } finally {
      setAddingSurfboardId(null)
    }
  }

  const handleRemoveSurfboard = async (surfboardId: string) => {
    if (!user?.id) return

    const tripSurfboardId = getTripSurfboardId(surfboardId)
    if (!tripSurfboardId) {
      showError('Error', 'Could not find surfboard in trip.')
      return
    }

    setRemovingSurfboardId(surfboardId)

    // Optimistic update
    setTrip((prev) =>
      prev
        ? {
            ...prev,
            surfboards: prev.surfboards?.filter(
              (sb) => sb.id !== tripSurfboardId,
            ),
          }
        : prev,
    )

    try {
      await removeSurfboard(currentTrip.id, tripSurfboardId, user.id)
      // Fetch updated trip data without reloading
      const cookie = document.cookie
      const updatedTrip = await get<Trip>(
        `trips/${currentTrip.id}?userId=${user.id}`,
        {
          headers: { Cookie: cookie },
        },
      )
      setTrip(updatedTrip)
    } catch (error) {
      console.error('Failed to remove surfboard:', error)
      // Rollback optimistic update
      const cookie = document.cookie
      const updatedTrip = await get<Trip>(
        `trips/${currentTrip.id}?userId=${user.id}`,
        {
          headers: { Cookie: cookie },
        },
      )
      setTrip(updatedTrip)
      showError(
        getErrorMessage(error, 'Failed to remove surfboard. Please try again.'),
      )
    } finally {
      setRemovingSurfboardId(null)
    }
  }

  return (
    <Page showHeader>
      <div className="info-page-content mv">
        <div ref={sectionsRef as RefObject<HTMLDivElement>}>
          <TextButton
            text="Back to Trips"
            onClick={() => navigate('/trips')}
            iconKey="chevron-left"
          />
          <div className="row space-between">
            <h1>{currentTrip.title}</h1>
            {currentTrip.isOwner && (
              <div className="spot-actions">
                <TextButton
                  text="Edit"
                  onClick={() => navigate(`/edit-trip/${currentTrip.id}`)}
                  iconKey="edit"
                  filled
                />
                <TextButton
                  text="Delete"
                  onClick={handleDeleteClick}
                  iconKey="bin"
                  filled
                  danger
                />
              </div>
            )}
          </div>
          {!currentTrip.isOwner && (
            <p className="text-secondary">by {currentTrip.ownerName}</p>
          )}
          {currentTrip.startDate && currentTrip.endDate && (
            <p className="trip-dates">
              {formatDate(currentTrip.startDate)} - {formatDate(currentTrip.endDate)}
            </p>
          )}
          {currentTrip.description && (
            <p className="description">{currentTrip.description}</p>
          )}

          <ErrorBoundary message="Unable to load members">
            <section className="animate-on-scroll">
              <h3>Members</h3>
              {currentTrip.members && currentTrip.members.length > 0 ? (
                <div className="trip-members-list">
                  {(currentTrip.members || []).map((member) => (
                    <div key={member.id} className="trip-member-item">
                      <div>
                        <div className="member-email-row">
                          <span className="member-email">
                            {member.userEmail}
                          </span>
                          {member.status === 'PENDING' && (
                            <Chip label="Invite Sent" isFilled={false} />
                          )}
                        </div>
                      </div>
                      {currentTrip.isOwner && (
                        <TextButton
                          text={
                            member.status === 'PENDING' ? 'Cancel' : 'Remove'
                          }
                          onClick={async () => {
                            if (!user?.id) return
                            try {
                              if (member.status === 'PENDING') {
                                await cancelInvitation(
                                  currentTrip.id,
                                  member.id,
                                  user.id,
                                )
                              } else {
                                await removeMember(
                                  currentTrip.id,
                                  member.id,
                                  user.id,
                                )
                              }
                              setTrip((prev) => {
                                if (!prev) return prev
                                return {
                                  ...prev,
                                  members: prev.members?.filter(
                                    (m) => m.id !== member.id,
                                  ),
                                }
                              })
                            } catch (error) {
                              console.error('Failed to remove member:', error)
                              showError(
                                getErrorMessage(
                                  error,
                                  'Failed to remove member. Please try again.',
                                ),
                              )
                            }
                          }}
                          iconKey="bin"
                          filled
                          danger
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Members"
                  description="No members have been added to this trip yet."
                  ctaText="Add Members"
                  onCtaClick={() => navigate(`/edit-trip/${currentTrip.id}`)}
                />
              )}
            </section>
          </ErrorBoundary>

          <ErrorBoundary message="Unable to load surf spots">
            <section className="animate-on-scroll">
              <h3>Surf Spots</h3>
              {currentTrip.spots && currentTrip.spots.length > 0 ? (
                <div className="trip-spots-list">
                  {currentTrip.spots.map((spot) => (
                    <div key={spot.id} className="trip-spot-item">
                      <div>
                        <a
                          href={`/surf-spots/id/${spot.surfSpotId}`}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <h4>{spot.surfSpotName}</h4>
                        </a>
                        {spot.surfSpotRating && (
                          <div className="spot-rating">
                            <Rating value={spot.surfSpotRating} readOnly />
                          </div>
                        )}
                      </div>
                      {currentTrip.isOwner && (
                        <TextButton
                          text="Remove"
                          onClick={async () => {
                            if (!user?.id) return
                            try {
                              await removeSpot(currentTrip.id, spot.id, user.id)
                              setTrip((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      spots: prev.spots?.filter(
                                        (s) => s.id !== spot.id,
                                      ),
                                    }
                                  : prev,
                              )
                            } catch (error) {
                              console.error('Failed to remove spot:', error)
                              showError(
                                getErrorMessage(
                                  error,
                                  'Failed to remove spot. Please try again.',
                                ),
                              )
                            }
                          }}
                          iconKey="bin"
                          filled
                          danger
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Surf Spots"
                  description="No surf spots have been added to this trip yet."
                  ctaText="Explore Surf Spots"
                  onCtaClick={() => navigate('/surf-spots')}
                />
              )}
            </section>
          </ErrorBoundary>

          <ErrorBoundary message="Unable to load surfboards">
            <section className="animate-on-scroll">
              <h3>Surfboards</h3>
              {currentTrip.isOwner && (
                <TextButton
                  text="Add Surfboard"
                  onClick={handleAddSurfboardClick}
                  iconKey="plus"
                  filled
                />
              )}
              {currentTrip.surfboards && currentTrip.surfboards.length > 0 ? (
                <div className="trip-spots-list">
                  {currentTrip.surfboards.map((surfboard) => (
                    <div key={surfboard.id} className="trip-spot-item">
                      <div>
                        <a
                          href={`/surfboard/${surfboard.surfboardId}`}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <h4>{surfboard.surfboardName}</h4>
                        </a>
                      </div>
                      {currentTrip.isOwner && (
                        <TextButton
                          text="Remove"
                          onClick={async () => {
                            if (!user?.id) return
                            try {
                              await removeSurfboard(
                                currentTrip.id,
                                surfboard.id,
                                user.id,
                              )
                              setTrip((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      surfboards: prev.surfboards?.filter(
                                        (sb) => sb.id !== surfboard.id,
                                      ),
                                    }
                                  : prev,
                              )
                            } catch (error) {
                              console.error(
                                'Failed to remove surfboard:',
                                error,
                              )
                              showError(
                                getErrorMessage(
                                  error,
                                  'Failed to remove surfboard. Please try again.',
                                ),
                              )
                            }
                          }}
                          iconKey="bin"
                          filled
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="trip-spots-list empty">
                  <p className="text-secondary">
                    No surfboards have been added to this trip yet.
                  </p>
                </div>
              )}
            </section>
          </ErrorBoundary>

          <ErrorBoundary message="Unable to load media">
            <section className="animate-on-scroll">
              <h3>Media</h3>
              <MediaGallery
                items={
                  currentTrip.media?.map((media) => ({
                    id: media.id,
                    url: media.url,
                    mediaType:
                      media.mediaType === 'image' || media.mediaType === 'video'
                        ? media.mediaType
                        : ('image' as const),
                    alt: 'Trip media',
                  })) || []
                }
                canDelete={currentTrip.isOwner && !!user?.id}
                onDelete={async (item) => {
                  if (user?.id) {
                    try {
                      await deleteMedia(currentTrip.id, item.id, user.id)
                      setTrip((prev) =>
                        prev
                          ? {
                              ...prev,
                              media: prev.media?.filter(
                                (m) => m.id !== item.id,
                              ),
                            }
                          : prev,
                      )
                    } catch (error) {
                      console.error('Error deleting media:', error)
                      showError(
                        getErrorMessage(
                          error,
                          'Failed to delete media. Please try again.',
                        ),
                      )
                      throw error
                    }
                  }
                }}
                altText="Trip media"
              />

              {currentTrip.isOwner && (
                <div className="trip-media-upload">
                  {uploadError && (
                    <p className="text-error mb">{uploadError}</p>
                  )}
                  {uploadSuccess && (
                    <p className="mb" style={{ color: 'green' }}>
                      Media uploaded successfully!
                    </p>
                  )}
                  {isUploading && <p className="mb">Uploading media...</p>}
                  <MediaUpload
                    onFilesSelected={(files) => {
                      if (!user?.id || !currentTrip?.id) return
                      uploadFiles(files, 'add-media', 'image')
                    }}
                    accept="image/*,video/*"
                    multiple
                    disabled={isUploading}
                  />
                </div>
              )}
            </section>
          </ErrorBoundary>
        </div>
      </div>

      {showDeleteConfirm && (
        <Modal onClose={() => setShowDeleteConfirm(false)}>
          <div className="delete-confirm-modal">
            <h2>Delete Trip</h2>
            <p>
              Are you sure you want to delete this trip? This action cannot be
              undone.
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

      {showErrorModal && (
        <InfoModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          title={errorTitle}
          message={errorMessage}
        />
      )}

      {showAddSurfboardModal && (
        <Modal onClose={() => setShowAddSurfboardModal(false)}>
          <div className="surfboard-selection-modal">
            <h2>Add Surfboard</h2>
            {allSurfboards.length > 0 ? (
              <div>
                <p>Select a surfboard to add or remove from this trip:</p>
                <div className="surfboard-selection-list">
                  {allSurfboards.map((surfboard) => {
                    const isInTrip = isSurfboardInTrip(surfboard.id)
                    const isAdding = addingSurfboardId === surfboard.id
                    const isRemoving = removingSurfboardId === surfboard.id

                    return (
                      <div
                        key={surfboard.id}
                        className="surfboard-selection-item"
                      >
                        <div>
                          <span className="surfboard-name bold">
                            {surfboard.name}
                          </span>
                        </div>
                        {isAdding ? (
                          <span className="status-text bold">Adding...</span>
                        ) : isRemoving ? (
                          <span className="status-text bold">Removing...</span>
                        ) : isInTrip ? (
                          <TextButton
                            text="Remove"
                            onClick={() => handleRemoveSurfboard(surfboard.id)}
                            iconKey="bin"
                            filled
                            danger
                            disabled={
                              addingSurfboardId !== null ||
                              removingSurfboardId !== null
                            }
                          />
                        ) : (
                          <TextButton
                            text="Add"
                            onClick={() => handleAddSurfboard(surfboard.id)}
                            iconKey="plus"
                            filled
                            disabled={
                              addingSurfboardId !== null ||
                              removingSurfboardId !== null
                            }
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="surfboard-selection-actions">
                  <Button
                    label="Cancel"
                    variant="cancel"
                    onClick={() => setShowAddSurfboardModal(false)}
                  />
                </div>
              </div>
            ) : (
              <div>
                <p>No available surfboards to add.</p>
                <p className="text-secondary">
                  Create a surfboard first to add it to this trip.
                </p>
                <div className="surfboard-selection-actions">
                  <Button
                    label="Cancel"
                    variant="cancel"
                    onClick={() => setShowAddSurfboardModal(false)}
                  />
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </Page>
  )
}
