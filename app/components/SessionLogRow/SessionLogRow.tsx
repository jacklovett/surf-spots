import { useEffect, useId, useMemo, useState } from 'react'
import { Link, useFetcher, useLocation, useNavigate } from 'react-router'
import classNames from 'classnames'

import {
  DirectionIcon,
  DropdownMenu,
  ErrorBoundary,
  Icon,
  MediaGallery,
  MediaUpload,
  ConfirmDestructiveModal,
  Rating,
  SurfHeightIcon,
  TideIcon,
} from '~/components'
import { useToastContext, useUserContext } from '~/contexts'
import { liveSessionDetailsPath } from '~/constants/liveSessionPaths'
import { buildAddSurfSpotPathForUnassignedSession } from '~/utils/surfSessionFormUtils'
import { useEndLiveSession, useFileUpload, useDestructiveConfirmBusy } from '~/hooks'
import type { BaseActionData } from '~/hooks/useActionFetcher'
import {
  CROWD_LEVEL_LABELS,
  EXTERNAL_SESSION_PROVIDER_LABELS,
  SURF_SESSION_RATING_LABELS,
  SURF_SESSION_WAVE_SIZE_LABELS,
  WAVE_FACE_LABELS,
  Tide,
  SurfSessionListItem,
  SessionStatus,
  SurfSessionMedia,
} from '~/types/surfSpots'
import { TIDE_OPTIONS } from '~/types/formData/surfSpots'
import { formatSurfSessionTimeRange } from '~/utils/dateUtils'
import {
  ERROR_BOUNDARY_MEDIA,
  ERROR_DELETE_MEDIA,
  ERROR_DELETE_SESSION,
  getSafeFetcherErrorMessage,
} from '~/utils/errorUtils'

interface SessionLogRowProps {
  session: SurfSessionListItem
  formatSessionDate: (isoDate: string) => string
}

interface SessionMediaActionData extends BaseActionData {
  media?: SurfSessionMedia
}

const sessionRatingLabel = (sessionRating?: number | null): string => {
  if (sessionRating == null) {
    return '—'
  }
  return SURF_SESSION_RATING_LABELS[sessionRating] ?? `${sessionRating} out of 5`
}

const tideDisplay = (tide?: Tide | string | null): string => {
  if (tide == null || tide === '') {
    return ''
  }
  const opt = TIDE_OPTIONS.find((o) => o.value === tide)
  return opt?.label ?? String(tide)
}

const formatDirectionDisplay = (value?: string | null): string =>
  value ? value.replace(/-/g, ' to ') : '—'

const SESSION_CONDITION_ICON_SIZE = 26

export const SessionLogRow = (props: SessionLogRowProps) => {
  const { session, formatSessionDate } = props
  const { user } = useUserContext()
  const { showSuccess, showError } = useToastContext()
  const { endSession, isEnding } = useEndLiveSession()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [expanded, setExpanded] = useState(false)
  const [showMediaSection, setShowMediaSection] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const panelId = useId()
  const sessionTimeRange = formatSurfSessionTimeRange(session)
  const provider = session.externalSessionProvider
  const externalSyncSourceLabel =
    provider == null ? null : EXTERNAL_SESSION_PROVIDER_LABELS[provider] ?? provider

  const isInProgress = session.status === SessionStatus.IN_PROGRESS

  const {
    uploadFiles,
    isUploading,
    error: uploadError,
    clearError: clearUploadError,
    fetcherData: uploadFetcherData,
  } = useFileUpload({
    directUpload: {
      // Remix route api.surf-session.$id.upload-url (singular); backend path is surf-sessions/.../media/upload-url.
      getUploadUrlApi: (mediaType: string) =>
        `/api/surf-session/${session.id}/upload-url?mediaType=${encodeURIComponent(mediaType)}`,
      recordActionUrl: pathname,
      extraRecordFields: { sessionId: String(session.id) },
    },
  })

  const mediaActionFetcher = useFetcher<SessionMediaActionData>()
  const sessionDeleteFetcher = useFetcher<BaseActionData>()
  const {
    busy: deleteModalBusy,
    beginSubmit: beginSessionDeleteSubmit,
    clearArmed: clearSessionDeleteArmed,
  } = useDestructiveConfirmBusy(showDeleteConfirm, sessionDeleteFetcher.state !== 'idle')

  useEffect(() => {
    if (uploadFetcherData?.success && uploadFetcherData?.media) {
      showSuccess('Media uploaded successfully!')
    }
  }, [uploadFetcherData, showSuccess])

  useEffect(() => {
    if (uploadError) {
      showError(uploadError)
      clearUploadError()
    }
  }, [uploadError, showError, clearUploadError])

  useEffect(() => {
    if (mediaActionFetcher.state !== 'idle' || mediaActionFetcher.data == null) return
    if (mediaActionFetcher.data.success) {
      showSuccess('Media deleted successfully!')
      return
    }
    const message = getSafeFetcherErrorMessage(
      mediaActionFetcher.data,
      ERROR_DELETE_MEDIA,
    )
    showError(message)
  }, [mediaActionFetcher.data, mediaActionFetcher.state, showSuccess, showError])

  useEffect(() => {
    if (sessionDeleteFetcher.state !== 'idle' || sessionDeleteFetcher.data == null) {
      return
    }

    if (sessionDeleteFetcher.data.success) {
      showSuccess('Session deleted.')
      setShowDeleteConfirm(false)
      return
    }

    const message = getSafeFetcherErrorMessage(
      sessionDeleteFetcher.data,
      ERROR_DELETE_SESSION,
    )
    showError(message)
    clearSessionDeleteArmed()
  }, [sessionDeleteFetcher.data, sessionDeleteFetcher.state, showSuccess, showError, clearSessionDeleteArmed])

  const mediaItems = session.media ?? []

  const sessionSpotMenuItems = useMemo(() => {
    const base = session.spotPath?.replace(/\/+$/, '')
    const items = [
      {
        label: session.spotPath ? 'Go to spot' : 'Add surf spot',
        iconKey: 'pin',
        onClick: () => {
          if (session.spotPath) {
            navigate(session.spotPath)
            return
          }
          const addSpotPath = buildAddSurfSpotPathForUnassignedSession(session)
          navigate(addSpotPath ?? '/add-surf-spot')
        },
      },
    ]

    if (!isInProgress) {
      items.push({
        label: 'Add session',
        iconKey: 'stopwatch',
        onClick: () => navigate(`${base}/session`),
      })
    }

    items.push(
      isInProgress
        ? {
            label: 'End session',
            iconKey: 'stopwatch',
            onClick: () => {
              if (!isEnding) {
                endSession(session.id, {
                  onSuccess: () => navigate(liveSessionDetailsPath(session.id)),
                })
              }
            },
          }
        : {
            label: 'Edit session',
            iconKey: 'edit',
            onClick: () => navigate(`/edit-session/${session.id}`),
          },
    )
    if (!isInProgress) {
      items.push({
        label: 'Delete session',
        iconKey: 'bin',
        onClick: () => {
          setShowDeleteConfirm(true)
        },
      })
    }
    return items
  }, [endSession, isEnding, navigate, session])

  const handleFileUpload = (files: FileList) => {
    if (!user?.id) return
    uploadFiles(files)
  }

  const submitDeleteMedia = (mediaId: string) => {
    const formData = new FormData()
    formData.append('intent', 'delete-media')
    formData.append('mediaId', mediaId)
    mediaActionFetcher.submit(formData, { method: 'POST', action: pathname })
  }

  const submitDeleteSession = () => {
    beginSessionDeleteSubmit(() => {
      const formData = new FormData()
      formData.append('intent', 'delete-session')
      formData.append('sessionId', String(session.id))
      sessionDeleteFetcher.submit(formData, { method: 'POST', action: '/sessions' })
    })
  }

  return (
    <article
      className={classNames(
        'accordion-card',
        'session-log-accordion-card',
        {
          'accordion-card-expanded': expanded,
        },
      )}
    >
      <div className="accordion-card-row">
        <div className="accordion-card-top">
          <button
            type="button"
            className="accordion-card-toggle"
            aria-expanded={expanded}
            aria-controls={panelId}
            onClick={() =>
              setExpanded((isExpanded) => {
                const nextExpanded = !isExpanded
                if (!nextExpanded) {
                  setShowMediaSection(false)
                }
                return nextExpanded
              })
            }
          >
            <span
              className={classNames('accordion-card-chevron', {
                'accordion-card-chevron-open': expanded,
              })}
              aria-hidden
            >
              <Icon iconKey="chevron-down" useCurrentColor />
            </span>
            <span className="accordion-card-primary">
              <span className="session-log-card-spot">{session.surfSpotName}</span>
              <span className="session-log-card-meta text-secondary">
                <span className="session-log-card-date-line">
                  {formatSessionDate(session.sessionDate)}
                </span>
                {(sessionTimeRange || externalSyncSourceLabel || isInProgress) && (
                  <span className="session-log-card-meta-detail">
                    {isInProgress && (
                      <span className="session-log-card-live-line bold">In progress</span>
                    )}
                    {!!sessionTimeRange && (
                      <span className="session-log-card-time-range">
                        {sessionTimeRange}
                      </span>
                    )}
                    {!!externalSyncSourceLabel && (
                      <span className="session-log-card-sync-line">
                        Synced from {externalSyncSourceLabel}
                      </span>
                    )}
                  </span>
                )}
              </span>
            </span>
            <span className="session-log-card-status">
              {session.sessionRating != null ? (
                <Rating
                  value={session.sessionRating}
                  readOnly
                  size="compact"
                />
              ) : (
                <span className="session-log-card-rating-unset">—</span>
              )}
            </span>
          </button>
        </div>
        <div className="session-log-card-actions">
          <DropdownMenu
            items={sessionSpotMenuItems}
            align="right"
            useCurrentColor
          />
        </div>
      </div>
      {expanded && (
        <div
          id={panelId}
          className="accordion-card-panel"
          role="region"
          aria-label={`Details for ${session.surfSpotName}`}
        >
          {externalSyncSourceLabel && (
            <p className="session-log-external-sync-note text-secondary font-small">
              Editing or deleting here only changes your Surf Spots copy. It does not
              update or remove the session in {externalSyncSourceLabel}.
            </p>
          )}
          <dl className="session-log-card-dl">
            <div
              className="session-log-card-dl-group session-log-card-dl-group-with-icons"
              aria-label="Conditions with icons"
            >
              <div className="session-log-card-dl-row">
                <dt>Swell</dt>
                <dd className="session-log-card-dd-with-condition">
                  {!!session.swellDirection && (
                    <span className="session-log-card-condition-svg" aria-hidden>
                      <DirectionIcon
                        type="swell"
                        directionRange={session.swellDirection}
                        size={SESSION_CONDITION_ICON_SIZE}
                        color="currentColor"
                      />
                    </span>
                  )}
                  {formatDirectionDisplay(session.swellDirection)}
                </dd>
              </div>
              <div className="session-log-card-dl-row">
                <dt>Wind</dt>
                <dd className="session-log-card-dd-with-condition">
                  {!!session.windDirection && (
                    <span className="session-log-card-condition-svg" aria-hidden>
                      <DirectionIcon
                        type="wind"
                        directionRange={session.windDirection}
                        size={SESSION_CONDITION_ICON_SIZE}
                        color="currentColor"
                      />
                    </span>
                  )}
                  {formatDirectionDisplay(session.windDirection)}
                </dd>
              </div>
              <div className="session-log-card-dl-row">
                <dt>Tide</dt>
                <dd className="session-log-card-dd-with-condition">
                  {session.tide && (
                    <span className="session-log-card-condition-svg" aria-hidden>
                      <TideIcon
                        tide={session.tide}
                        size={SESSION_CONDITION_ICON_SIZE}
                        color="currentColor"
                      />
                    </span>
                  )}
                  {tideDisplay(session.tide) || '—'}
                </dd>
              </div>
              <div className="session-log-card-dl-row">
                <dt>Wave size</dt>
                <dd className="session-log-card-dd-with-condition">
                  <span className="session-log-card-condition-svg" aria-hidden>
                    <SurfHeightIcon
                      size={SESSION_CONDITION_ICON_SIZE}
                      color="currentColor"
                    />
                  </span>
                  {session.waveSize ? SURF_SESSION_WAVE_SIZE_LABELS[session.waveSize] : '—'}
                </dd>
              </div>
            </div>
            <div
              className="session-log-card-dl-group session-log-card-dl-group-text-fields"
              aria-label="Session details"
            >
              <div className="session-log-card-dl-row">
                <dt>Board</dt>
                <dd>
                  {session.surfboardId && session.surfboardName ? (
                    <Link
                      to={`/surfboard/${session.surfboardId}`}
                      prefetch="intent"
                      className="session-log-card-board-link"
                    >
                      {session.surfboardName}
                    </Link>
                  ) : session.surfboardName ? (
                    session.surfboardName
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div className="session-log-card-dl-row">
                <dt>Wave face</dt>
                <dd>
                  {session.waveFace
                    ? WAVE_FACE_LABELS[session.waveFace]
                    : '—'}
                </dd>
              </div>
              <div className="session-log-card-dl-row">
                <dt>Crowd</dt>
                <dd>
                  {session.crowdLevel
                    ? CROWD_LEVEL_LABELS[session.crowdLevel]
                    : '—'}
                </dd>
              </div>
              <div className="session-log-card-dl-row">
                <dt>Overall rating</dt>
                <dd className="session-log-card-rating-detail">
                  {session.sessionRating != null ? (
                    <>
                      <Rating value={session.sessionRating} readOnly size="compact" />
                      {sessionRatingLabel(session.sessionRating)}
                    </>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
            </div>
            {session.sessionNotes && (
              <div className="session-log-card-notes">
                <dt>Notes</dt>
                <dd className="session-log-card-notes-body">
                  {session.sessionNotes}
                </dd>
              </div>
            )}
          </dl>

          <ErrorBoundary message={ERROR_BOUNDARY_MEDIA}>
            <section>
              <button
                type="button"
                className="session-log-card-media-toggle-link"
                aria-expanded={showMediaSection}
                onClick={() =>
                  setShowMediaSection((isMediaSectionVisible) => !isMediaSectionVisible)
                }
              >
                <span>
                  {showMediaSection
                    ? 'Hide media'
                    : mediaItems.length === 0
                      ? 'Add media'
                      : 'Show media'}
                </span>
                <span
                  className={classNames('session-log-card-media-toggle-chevron', {
                    'session-log-card-media-toggle-chevron-open':
                      showMediaSection,
                  })}
                  aria-hidden
                >
                  <Icon iconKey="chevron-down" useCurrentColor />
                </span>
              </button>
              <div
                className={classNames('session-log-card-media-reveal', {
                  'session-log-card-media-reveal-open': showMediaSection,
                })}
                aria-hidden={!showMediaSection}
              >
                <div className="session-log-card-media-reveal-inner">
                  <h3>Media</h3>
                  <MediaGallery
                    items={mediaItems.map((mediaItem) => ({
                      id: mediaItem.id,
                      url: mediaItem.originalUrl,
                      thumbUrl: mediaItem.thumbUrl,
                      mediaType: (mediaItem.mediaType || 'image') as 'image' | 'video',
                      alt: session.surfSpotName,
                    }))}
                    canDelete={!!user?.id}
                    onDelete={(item) => {
                      if (user?.id) {
                        submitDeleteMedia(item.id)
                      }
                    }}
                    altText={session.surfSpotName}
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
                      disabled={
                        isUploading || mediaActionFetcher.state === 'submitting'
                      }
                    />
                  </div>
                </div>
              </div>
            </section>
          </ErrorBoundary>
        </div>
      )}
      <ConfirmDestructiveModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
        }}
        onConfirm={submitDeleteSession}
        title="Delete session"
        confirmLabel="Delete"
        busy={deleteModalBusy}
      >
        <p>
          {externalSyncSourceLabel
            ? `This removes your Surf Spots copy only. The session in ${externalSyncSourceLabel} is not affected.`
            : 'Permanently remove this session from your history. This cannot be undone.'}
        </p>
      </ConfirmDestructiveModal>
    </article>
  )
}
