import { useId, useState } from 'react'
import { Link } from 'react-router'

import Icon from '~/components/Icon'
import {
  CROWD_LEVEL_LABELS,
  SURF_SESSION_WAVE_QUALITY_LABELS,
  SURF_SESSION_WAVE_SIZE_LABELS,
  Tide,
  WaveQuality,
  SurfSessionListItem,
} from '~/types/surfSpots'
import { TIDE_OPTIONS } from '~/types/formData/surfSpots'

interface SessionLogRowProps {
  session: SurfSessionListItem
  formatSessionDate: (isoDate: string) => string
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

export const SessionLogRow = (props: SessionLogRowProps) => {
  const { session, formatSessionDate } = props
  const [expanded, setExpanded] = useState(false)
  const panelId = useId()
  const mod = impressionModifier(session.waveQuality)

  return (
    <article className="session-log-card">
      <div className="session-log-card-row">
        <button
          type="button"
          className="session-log-card-toggle"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((v) => !v)}
        >
          <span
            className={`session-log-card-chevron${expanded ? ' session-log-card-chevron-open' : ''}`}
            aria-hidden
          >
            <Icon iconKey="chevron-down" useCurrentColor />
          </span>
          <span className="session-log-card-primary">
            <span className="session-log-card-spot">{session.surfSpotName}</span>
            <span className="session-log-card-date text-secondary">
              {formatSessionDate(session.sessionDate)}
            </span>
          </span>
          <span className="session-log-card-status">
            <span className="session-log-card-meta text-secondary">
              {session.surfboardName
                ? session.surfboardName
                : 'No board saved'}
            </span>
            <span
              className={`session-log-card-badge session-log-card-badge-${mod}`}
            >
              {impressionLabel(session.waveQuality)}
            </span>
          </span>
        </button>
        <Link
          to={session.spotPath}
          prefetch="intent"
          className="session-log-card-link"
        >
          View spot
        </Link>
      </div>
      {expanded && (
        <div
          id={panelId}
          className="session-log-card-panel"
          role="region"
          aria-label={`Details for ${session.surfSpotName}`}
        >
          <dl className="session-log-card-dl">
            <div className="session-log-card-dl-row">
              <dt>Swell</dt>
              <dd>{session.swellDirection?.replace(/-/g, ' to ') || '—'}</dd>
            </div>
            <div className="session-log-card-dl-row">
              <dt>Wind</dt>
              <dd>{session.windDirection?.replace(/-/g, ' to ') || '—'}</dd>
            </div>
            <div className="session-log-card-dl-row">
              <dt>Tide</dt>
              <dd>{tideDisplay(session.tide) || '—'}</dd>
            </div>
            <div className="session-log-card-dl-row">
              <dt>Wave size</dt>
              <dd>
                {session.waveSize
                  ? SURF_SESSION_WAVE_SIZE_LABELS[session.waveSize]
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
            {session.sessionNotes ? (
              <div className="session-log-card-notes">
                <dt>Your notes</dt>
                <dd className="session-log-card-notes-body">
                  {session.sessionNotes}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      )}
    </article>
  )
}

SessionLogRow.displayName = 'SessionLogRow'
