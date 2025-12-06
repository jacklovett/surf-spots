import { useState, RefObject, useEffect } from 'react'
import {
  data,
  LoaderFunction,
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
  Loading,
  MediaUpload,
  Modal,
  Page,
  Rating,
  TextButton,
} from '~/components'
import { useUserContext } from '~/contexts'
import { requireSessionCookie } from '~/services/session.server'
import { cacheControlHeader, get } from '~/services/networkService'
import {
  deleteTrip,
  removeSpot,
  removeMember,
  cancelInvitation,
  deleteMedia,
} from '~/services/trip'
import { Trip } from '~/types/trip'
import { useScrollReveal } from '~/hooks'
import { InfoModal } from '~/components/Modal'

interface LoaderData {
  trip: Trip
  error?: string
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

  const sectionsRef = useScrollReveal()

  // Sync state with loader data when it changes (e.g., after navigation)
  useEffect(() => {
    if (initialTrip) {
      setTrip(initialTrip)
    }
  }, [initialTrip])

  // Helper to extract error message
  const getErrorMessage = (error: unknown, defaultMessage: string): string => {
    return error instanceof Error ? error.message : defaultMessage
  }

  // Early returns for loading/error states
  if (navigation.state === 'loading' && !loaderData) {
    return (
      <Page showHeader overrideLoading>
        <ContentStatus>
          <Loading />
        </ContentStatus>
      </Page>
    )
  }

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

  return (
    <Page showHeader>
      <div className="info-page-content mv">
        <div ref={sectionsRef as RefObject<HTMLDivElement>}>
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
                />
              </div>
            )}
          </div>
          {!currentTrip.isOwner && (
            <p className="text-secondary">by {currentTrip.ownerName}</p>
          )}
          {currentTrip.startDate && currentTrip.endDate && (
            <p className="trip-dates">
              {new Date(currentTrip.startDate).toLocaleDateString()} -{' '}
              {new Date(currentTrip.endDate).toLocaleDateString()}
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
                  ctaHref={`/edit-trip/${currentTrip.id}`}
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
                  ctaHref="/surf-spots"
                />
              )}
            </section>
          </ErrorBoundary>

          <ErrorBoundary message="Unable to load media">
            <section className="animate-on-scroll">
              <h3>Media</h3>
              {currentTrip.media && currentTrip.media.length > 0 && (
                <div className="trip-media">
                  {currentTrip.media.map((media) => (
                    <div key={media.id} className="trip-media-item">
                      {media.mediaType === 'image' ? (
                        <img src={media.url} alt="Trip media" />
                      ) : (
                        <video src={media.url} controls>
                          Your browser does not support the video tag.
                        </video>
                      )}
                      {trip.isOwner && (
                        <TextButton
                          text="Delete"
                          iconKey="bin"
                          onClick={async () => {
                            if (!user?.id) return
                            try {
                              await deleteMedia(trip.id, media.id, user.id)
                              setTrip((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      media: prev.media?.filter(
                                        (m) => m.id !== media.id,
                                      ),
                                    }
                                  : prev,
                              )
                            } catch (error) {
                              console.error('Failed to delete media:', error)
                              showError(
                                getErrorMessage(
                                  error,
                                  'Failed to delete media. Please try again.',
                                ),
                              )
                            }
                          }}
                          filled
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {currentTrip.isOwner && (
                <div className="trip-media-upload">
                  <MediaUpload
                    onFilesSelected={(files) => {
                      // TODO: Implement file upload
                      console.log('Files selected:', files)
                      showError(
                        'Media upload feature coming soon!',
                        'Coming Soon',
                      )
                    }}
                    accept="image/*,video/*"
                    multiple
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
    </Page>
  )
}
