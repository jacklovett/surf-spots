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
  SurfHeightIcon,
  TideIcon,
} from '~/components'
import { useToastContext, useUserContext } from '~/contexts'
import { useFileUpload } from '~/hooks'
import {
  CROWD_LEVEL_LABELS,
  SURF_SESSION_WAVE_QUALITY_LABELS,
  SURF_SESSION_WAVE_SIZE_LABELS,
  Tide,
  WaveQuality,
  SurfSessionListItem,
  SurfSessionMedia,
} from '~/types/surfSpots'
import { TIDE_OPTIONS } from '~/types/formData/surfSpots'
import {
  ERROR_BOUNDARY_MEDIA,
  ERROR_DELETE_MEDIA,
  getSafeFetcherErrorMessage,
} from '~/utils/errorUtils'

interface SessionLogRowProps {
  session: SurfSessionListItem
  formatSessionDate: (isoDate: string) => string
}

interface SessionMediaActionData {
  error?: string
  success?: boolean
  media?: SurfSessionMedia
}

const impressionLabel = (waveQuality: WaveQuality | null | undefined): string => {
  if (waveQuality == null) {
    return '—'
  }
  if (waveQuality === WaveQuality.GREAT || waveQuality === WaveQuality.FUN) {
    return 'Good'
  }
  if (waveQuality === WaveQuality.OKAY) {
    return 'OK'
  }
  return 'Tough'
}

const impressionModifier = (
  waveQuality: WaveQuality | null | undefined,
): 'good' | 'ok' | 'tough' | 'unset' => {
  if (waveQuality == null) {
    return 'unset'
  }
  if (waveQuality === WaveQuality.GREAT || waveQuality === WaveQuality.FUN) {
    return 'good'
  }
  if (waveQuality === WaveQuality.OKAY) {
    return 'ok'
  }
  return 'tough'
}

const tideDisplay = (tide: Tide | string | null | undefined): string => {
  if (tide == null || tide === '') {
    return ''
  }
  const opt = TIDE_OPTIONS.find((o) => o.value === tide)
  return opt?.label ?? String(tide)
}

const formatDirectionDisplay = (value: string | null | undefined): string =>
  value ? value.replace(/-/g, ' to ') : '—'

const SESSION_CONDITION_ICON_COLOR = 'var(--primary-color)'
const SESSION_CONDITION_ICON_SIZE = 26

export const SessionLogRow = (props: SessionLogRowProps) => {
  const { session, formatSessionDate } = props
  const { user } = useUserContext()
  const { showSuccess, showError } = useToastContext()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [expanded, setExpanded] = useState(false)
  const [showMediaSection, setShowMediaSection] = useState(false)
  const panelId = useId()
  const mod = impressionModifier(session.waveQuality)

  const {
    uploadFiles,
    isUploading,
    error: uploadError,
    clearError: clearUploadError,
    fetcherData: uploadFetcherData,
  } = useFileUpload({
    directUpload: {
      getUploadUrlApi: (mediaType: string) =>
        `/api/surf-session/${session.id}/upload-url?mediaType=${encodeURIComponent(mediaType)}`,
      recordActionUrl: pathname,
      extraRecordFields: { sessionId: String(session.id) },
    },
  })

  const mediaActionFetcher = useFetcher<SessionMediaActionData>()

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

  const mediaItems = session.media ?? []

  const sessionSpotMenuItems = useMemo(() => {
    const base = session.spotPath.replace(/\/+$/, '')
    return [
      {
        label: 'Go to spot',
        iconKey: 'pin',
        onClick: () => navigate(session.spotPath),
      },
      {
        label: 'Add session',
        iconKey: 'stopwatch',
        onClick: () => navigate(`${base}/session`),
      },
    ]
  }, [navigate, session.spotPath])

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

  return (
    <article
      className={classNames('accordion-card', {
        'accordion-card-expanded': expanded,
      })}
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
              <span className="session-log-card-date text-secondary">
                {formatSessionDate(session.sessionDate)}
              </span>
            </span>
            <span className="session-log-card-status">
              <span
                className={classNames(
                  'session-log-card-badge',
                  `session-log-card-badge-${mod}`,
                )}
              >
                {impressionLabel(session.waveQuality)}
              </span>
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
          <dl className="session-log-card-dl">
            <div
              className="session-log-card-dl-group session-log-card-dl-group-with-icons"
              aria-label="Conditions with icons"
            >
              <div className="session-log-card-dl-row">
                <dt>Swell</dt>
                <dd>
                  <span className="session-log-card-dd-with-condition">
                    {session.swellDirection ? (
                      <span className="session-log-card-condition-svg" aria-hidden>
                        <DirectionIcon
                          type="swell"
                          directionRange={session.swellDirection}
                          color={SESSION_CONDITION_ICON_COLOR}
                          size={SESSION_CONDITION_ICON_SIZE}
                        />
                      </span>
                    ) : null}
                    <span>{formatDirectionDisplay(session.swellDirection)}</span>
                  </span>
                </dd>
              </div>
              <div className="session-log-card-dl-row">
                <dt>Wind</dt>
                <dd>
                  <span className="session-log-card-dd-with-condition">
                    {session.windDirection ? (
                      <span className="session-log-card-condition-svg" aria-hidden>
                        <DirectionIcon
                          type="wind"
                          directionRange={session.windDirection}
                          color={SESSION_CONDITION_ICON_COLOR}
                          size={SESSION_CONDITION_ICON_SIZE}
                        />
                      </span>
                    ) : null}
                    <span>{formatDirectionDisplay(session.windDirection)}</span>
                  </span>
                </dd>
              </div>
              <div className="session-log-card-dl-row">
                <dt>Tide</dt>
                <dd>
                  <span className="session-log-card-dd-with-condition">
                    {session.tide ? (
                      <span className="session-log-card-condition-svg" aria-hidden>
                        <TideIcon
                          tide={session.tide}
                          color={SESSION_CONDITION_ICON_COLOR}
                          size={SESSION_CONDITION_ICON_SIZE}
                        />
                      </span>
                    ) : null}
                    <span>{tideDisplay(session.tide) || '—'}</span>
                  </span>
                </dd>
              </div>
              <div className="session-log-card-dl-row">
                <dt>Wave size</dt>
                <dd>
                  <span className="session-log-card-dd-with-condition">
                    <span className="session-log-card-condition-svg" aria-hidden>
                      <SurfHeightIcon
                        color={SESSION_CONDITION_ICON_COLOR}
                        size={SESSION_CONDITION_ICON_SIZE}
                      />
                    </span>
                    <span>
                      {session.waveSize
                        ? SURF_SESSION_WAVE_SIZE_LABELS[session.waveSize]
                        : '—'}
                    </span>
                  </span>
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
                <dt>Crowd</dt>
                <dd>
                  {session.crowdLevel
                    ? CROWD_LEVEL_LABELS[session.crowdLevel]
                    : '—'}
                </dd>
              </div>
              <div className="session-log-card-dl-row">
                <dt>How it felt</dt>
                <dd>
                  {session.waveQuality
                    ? SURF_SESSION_WAVE_QUALITY_LABELS[session.waveQuality]
                    : '—'}
                </dd>
              </div>
              <div className="session-log-card-dl-row">
                <dt>Surf again (similar conditions)</dt>
                <dd>
                  {session.wouldSurfAgain === true
                    ? 'Yes'
                    : session.wouldSurfAgain === false
                      ? 'No'
                      : '—'}
                </dd>
              </div>
            </div>
            {session.sessionNotes ? (
              <div className="session-log-card-notes">
                <dt>Your notes</dt>
                <dd className="session-log-card-notes-body">
                  {session.sessionNotes}
                </dd>
              </div>
            ) : null}
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
                <span>{showMediaSection ? 'Hide media' : 'Show media'}</span>
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
    </article>
  )
}

SessionLogRow.displayName = 'SessionLogRow'
