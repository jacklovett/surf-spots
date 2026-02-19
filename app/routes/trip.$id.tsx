import { useState, RefObject, useEffect } from 'react'
import {
  data,
  LoaderFunction,
  ActionFunction,
  useLoaderData,
  useNavigate,
  useParams,
  useLocation,
  redirect,
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
  SurfboardSelectionModal,
  TextButton,
} from '~/components'
import { useUserContext, useToastContext } from '~/contexts'
import { requireSessionCookie } from '~/services/session.server'
import {
  cacheControlHeader,
  get,
  post,
  deleteData,
  getDisplayMessage,
} from '~/services/networkService'
import { Trip, TripMedia } from '~/types/trip'
import { recordMedia } from '~/services/trip'
import { useScrollReveal, useFileUpload, useActionFetcher } from '~/hooks'
import { InfoModal } from '~/components/Modal'
import { formatDate } from '~/utils/dateUtils'
import { UPLOAD_ERROR_MEDIA_UNAVAILABLE } from '~/utils/errorUtils'
import { ActionData as BaseActionData } from '~/types/api'

interface LoaderData {
  trip: Trip
  error?: string
}

interface ActionData extends BaseActionData {
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
  const tripId = params.id
  if (!tripId) {
    return data<ActionData>({ error: 'Trip ID is required' }, { status: 400 })
  }

  const formData = await request.formData()
  const intent = formData.get('intent') as string
  const cookie = request.headers.get('Cookie') || ''

  // Handle delete trip
  if (intent === 'delete-trip') {
    try {
      await deleteData(`trips/${tripId}?userId=${user.id}`, {
        headers: { Cookie: cookie },
      })
      return redirect('/trips')
    } catch (error) {
      console.error('[trip.$id action] Error deleting trip:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        status: error instanceof Response ? error.status : undefined,
        tripId,
        userId: user.id,
      })
      return data<ActionData>(
        { error: getDisplayMessage(error, 'Failed to delete trip. Please try again.') },
        { status: 500 },
      )
    }
  }

  // Handle add surfboard
  if (intent === 'add-surfboard') {
    const surfboardId = formData.get('surfboardId') as string
    if (!surfboardId) {
      console.error('[trip.$id action] Missing surfboardId for add-surfboard')
      return data<ActionData>(
        { error: 'Surfboard ID is required' },
        { status: 400 },
      )
    }
    try {
      await post<undefined, string>(
        `trips/${tripId}/surfboards/${surfboardId}?userId=${user.id}`,
        undefined,
        { headers: { Cookie: cookie } },
      )
      return data<ActionData>({ success: true })
    } catch (error) {
      console.error('[trip.$id action] Error adding surfboard:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        status: error instanceof Response ? error.status : undefined,
        tripId,
        surfboardId,
        userId: user.id,
      })
      return data<ActionData>(
        { error: getDisplayMessage(error, 'Failed to add surfboard. Please try again.') },
        { status: 500 },
      )
    }
  }

  // Handle remove surfboard
  if (intent === 'remove-surfboard') {
    const tripSurfboardId = formData.get('tripSurfboardId') as string
    if (!tripSurfboardId) {
      console.error(
        '[trip.$id action] Missing tripSurfboardId for remove-surfboard',
      )
      return data<ActionData>(
        { error: 'Trip surfboard ID is required' },
        { status: 400 },
      )
    }
    try {
      await deleteData(
        `trips/${tripId}/surfboards/${tripSurfboardId}?userId=${user.id}`,
        { headers: { Cookie: cookie } },
      )
      return data<ActionData>({ success: true })
    } catch (error) {
      console.error('[trip.$id action] Error removing surfboard:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        status: error instanceof Response ? error.status : undefined,
        tripId,
        tripSurfboardId,
        userId: user.id,
      })
      return data<ActionData>(
        { error: getDisplayMessage(error, 'Failed to remove surfboard. Please try again.') },
        { status: 500 },
      )
    }
  }

  // Handle remove spot
  if (intent === 'remove-spot') {
    const tripSpotId = formData.get('tripSpotId') as string
    if (!tripSpotId) {
      console.error('[trip.$id action] Missing tripSpotId for remove-spot')
      return data<ActionData>(
        { error: 'Trip spot ID is required' },
        { status: 400 },
      )
    }
    try {
      await deleteData(
        `trips/${tripId}/spots/${tripSpotId}?userId=${user.id}`,
        { headers: { Cookie: cookie } },
      )
      return data<ActionData>({ success: true })
    } catch (error) {
      console.error('[trip.$id action] Error removing spot:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        status: error instanceof Response ? error.status : undefined,
        tripId,
        tripSpotId,
        userId: user.id,
      })
      return data<ActionData>(
        { error: getDisplayMessage(error, 'Failed to remove spot. Please try again.') },
        { status: 500 },
      )
    }
  }

  // Handle remove member
  if (intent === 'remove-member') {
    const memberUserId = formData.get('memberUserId') as string
    if (!memberUserId) {
      console.error('[trip.$id action] Missing memberUserId for remove-member')
      return data<ActionData>(
        { error: 'Member user ID is required' },
        { status: 400 },
      )
    }
    try {
      await deleteData(
        `trips/${tripId}/members/${memberUserId}?currentUserId=${user.id}`,
        { headers: { Cookie: cookie } },
      )
      return data<ActionData>({ success: true })
    } catch (error) {
      console.error('[trip.$id action] Error removing member:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        status: error instanceof Response ? error.status : undefined,
        tripId,
        memberUserId,
        currentUserId: user.id,
      })
      return data<ActionData>(
        { error: getDisplayMessage(error, 'Failed to remove member. Please try again.') },
        { status: 500 },
      )
    }
  }

  // Handle cancel invitation
  if (intent === 'cancel-invitation') {
    const invitationId = formData.get('invitationId') as string
    if (!invitationId) {
      console.error(
        '[trip.$id action] Missing invitationId for cancel-invitation',
      )
      return data<ActionData>(
        { error: 'Invitation ID is required' },
        { status: 400 },
      )
    }
    try {
      await deleteData(
        `trips/${tripId}/invitations/${invitationId}?userId=${user.id}`,
        { headers: { Cookie: cookie } },
      )
      return data<ActionData>({ success: true })
    } catch (error) {
      console.error('[trip.$id action] Error canceling invitation:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        status: error instanceof Response ? error.status : undefined,
        tripId,
        invitationId,
        userId: user.id,
      })
      return data<ActionData>(
        { error: getDisplayMessage(error, 'Failed to cancel invitation. Please try again.') },
        { status: 500 },
      )
    }
  }

  // Handle delete media
  if (intent === 'delete-media') {
    const mediaId = formData.get('mediaId') as string
    if (!mediaId) {
      console.error('[trip.$id action] Missing mediaId for delete-media')
      return data<ActionData>(
        { error: 'Media ID is required' },
        { status: 400 },
      )
    }
    try {
      await deleteData(`trips/${tripId}/media/${mediaId}?userId=${user.id}`, {
        headers: { Cookie: cookie },
      })
      return data<ActionData>({ success: true })
    } catch (error) {
      console.error('[trip.$id action] Error deleting media:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        status: error instanceof Response ? error.status : undefined,
        tripId,
        mediaId,
        userId: user.id,
      })
      return data<ActionData>(
        { error: getDisplayMessage(error, 'Failed to delete media. Please try again.') },
        { status: 500 },
      )
    }
  }

  // Record media after client uploaded directly to S3 (avoids FUNCTION_PAYLOAD_TOO_LARGE)
  if (intent === 'add-media') {
    const mediaId = formData.get('mediaId') as string
    const s3Url = formData.get('s3Url') as string
    const mediaType = (formData.get('mediaType') as string) || 'image'
    if (!mediaId || !s3Url) {
      return data<ActionData>(
        { error: 'Missing mediaId or s3Url' },
        { status: 400 },
      )
    }
    try {
      await recordMedia(
        tripId,
        user.id,
        { mediaId, url: s3Url, mediaType },
        { headers: { Cookie: cookie } },
      )
      return data<ActionData>({
        success: true,
        media: {
          id: mediaId,
          url: s3Url,
          mediaType,
          ownerId: user.id,
          ownerName: user.name || 'Unknown',
          uploadedAt: new Date().toISOString(),
        } as TripMedia,
      })
    } catch (error) {
      console.error('[trip.$id action] add-media failed', { tripId, mediaId, error })
      return data<ActionData>(
        { error: getDisplayMessage(error, UPLOAD_ERROR_MEDIA_UNAVAILABLE) },
        { status: 500 },
      )
    }
  }

  return data<ActionData>({ error: 'Invalid intent' }, { status: 400 })
}

export default function TripDetail() {
  const loaderData = useLoaderData<LoaderData>()
  const { trip: initialTrip, error } = loaderData || {
    trip: undefined,
    error: undefined,
  }
  const { user } = useUserContext()
  const { showSuccess, showError } = useToastContext()
  const navigate = useNavigate()
  const { fetcher, submitAction } = useActionFetcher<ActionData>()

  // Use state for optimistic UI updates when removing members/spots/media
  const [trip, setTrip] = useState<Trip | undefined>(initialTrip)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [showAddSurfboardModal, setShowAddSurfboardModal] = useState(false)
  const sectionsRef = useScrollReveal()

  const params = useParams()
  const location = useLocation()
  const tripId = params.id
  const {
    uploadFiles,
    isUploading,
    error: uploadError,
    clearError: clearUploadError,
    fetcherData,
  } = useFileUpload({
    directUpload: {
      getUploadUrlApi: (mediaType: string) =>
        `/api/trip/${tripId}/upload-url?mediaType=${mediaType}`,
      recordActionUrl: location.pathname,
    },
  })

  // Sync state with loader data when it changes (e.g., after navigation or revalidation)
  // Only sync if trip ID changed (navigation) or if we don't have local state
  // After actions complete, React Router revalidates and initialTrip updates with server state
  useEffect(() => {
    if (initialTrip) {
      // Only sync if:
      // 1. We don't have local state yet, OR
      // 2. The trip ID changed (navigation to different trip), OR
      // 3. We're on the same trip and action is idle (revalidation completed)
      if (
        !trip ||
        trip.id !== initialTrip.id ||
        (trip.id === initialTrip.id && fetcher.state === 'idle')
      ) {
        setTrip(initialTrip)
      }
    }
  }, [initialTrip, trip, fetcher.state])

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
      showSuccess('Media uploaded successfully!')
    }
  }, [fetcherData, showSuccess])

  // Handle upload errors (clears after showing so the same error can show a new toast if triggered again)
  useEffect(() => {
    if (uploadError) {
      showError(uploadError)
      clearUploadError()
    }
  }, [uploadError, showError, clearUploadError])

  // Handle delete trip errors
  useEffect(() => {
    if (fetcher.data?.error && fetcher.state === 'idle') {
      // Check if this is a delete-trip error by checking the formData intent
      // or by checking if we're in the delete confirm modal
      if (showDeleteConfirm) {
        setDeleteError(fetcher.data.error)
      }
    }
  }, [fetcher.data, fetcher.state, showDeleteConfirm])

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

  const handleDeleteConfirm = () => {
    if (!user?.id) return

    const formData = new FormData()
    formData.append('intent', 'delete-trip')
    fetcher.submit(formData, { method: 'POST' })
  }

  const handleAddSurfboardClick = () => {
    if (!user?.id) return
    setShowAddSurfboardModal(true)
  }

  const handleSubmitAction = (intent: string, data: Record<string, string>) =>
    submitAction(intent, data)

  const handleTripUpdate = (updater: (prev: Trip) => Trip) =>
    setTrip((prev) => {
      if (!prev) return prev
      return updater(prev)
    })

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
              {formatDate(currentTrip.startDate)} -{' '}
              {formatDate(currentTrip.endDate)}
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
                        <div className="member-email-row space-between">
                          <span className="member-email">
                            {member.userEmail}
                          </span>
                          <div className="member-actions">
                          {member.status === 'PENDING' && (
                            <Chip label="Invite Sent" isFilled={false} />
                          )}{currentTrip.isOwner && (
                            <TextButton
                              text={
                                member.status === 'PENDING' ? 'Cancel' : 'Remove'
                              }
                              onClick={() => {
                                if (!user?.id) return
                                // Optimistic update
                                setTrip((prev) => {
                                  if (!prev) return prev
                                  return {
                                    ...prev,
                                    members: prev.members?.filter(
                                      (m) => m.id !== member.id,
                                    ),
                                  }
                                })
                                // Submit action via fetcher - Remix will handle revalidation
                                if (member.status === 'PENDING') {
                                  submitAction('cancel-invitation', {
                                    invitationId: member.id,
                                  })
                                } else {
                                  if (!member.userId) {
                                    console.error('Cannot remove member: missing userId', member)
                                    return
                                  }
                                  submitAction('remove-member', {
                                    memberUserId: member.userId,
                                  })
                                }
                              }}
                              iconKey="bin"
                              filled
                              danger
                            />
                          )}
                        </div>
                      </div>
                      </div>
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
                        <a href={`/surf-spots/id/${spot.surfSpotId}`}>
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
                          onClick={() => {
                            if (!user?.id) return
                            // Optimistic update
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
                            // Submit action via fetcher - Remix will handle revalidation
                            submitAction('remove-spot', { tripSpotId: spot.id })
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
                        <a href={`/surfboard/${surfboard.surfboardId}`}>
                          <h4>{surfboard.surfboardName}</h4>
                        </a>
                      </div>
                      {currentTrip.isOwner && (
                        <TextButton
                          text="Remove"
                          onClick={() => {
                            if (!user?.id) return
                            const formData = new FormData()
                            formData.append('intent', 'remove-surfboard')
                            formData.append('tripSurfboardId', surfboard.id)
                            submitAction('remove-surfboard', {
                              tripSurfboardId: surfboard.id,
                            })

                            // Optimistic update
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
                onDelete={(item) => {
                  if (user?.id) {
                    // Optimistic update
                    setTrip((prev) =>
                      prev
                        ? {
                            ...prev,
                            media: prev.media?.filter((m) => m.id !== item.id),
                          }
                        : prev,
                    )

                    // Submit action via fetcher - Remix will handle revalidation
                    submitAction('delete-media', { mediaId: item.id })
                  }
                }}
                altText="Trip media"
              />

              {currentTrip.isOwner && (
                <div className="media-upload-container">
                  {isUploading && <p className="mb">Uploading media...</p>}
                  <MediaUpload
                    onFilesSelected={(files) => {
                      if (!user?.id || !currentTrip?.id) return
                      uploadFiles(files)
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

      {showAddSurfboardModal && currentTrip && (
        <SurfboardSelectionModal
          isOpen={showAddSurfboardModal}
          onClose={() => setShowAddSurfboardModal(false)}
          trip={currentTrip}
          userId={user?.id || ''}
          onSubmitAction={handleSubmitAction}
          onTripUpdate={handleTripUpdate}
          actionState={fetcher.state}
          actionData={fetcher.data}
        />
      )}
    </Page>
  )
}
