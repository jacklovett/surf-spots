import classNames from 'classnames'
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router'

import Button from '~/components/Button'
import Icon from '~/components/Icon'
import { liveSessionDetailsPath } from '~/constants/liveSessionPaths'
import { useLiveSessionContext } from '~/contexts'
import { useLiveSessionElapsedTime } from '~/hooks'

const isStartSessionRoute = (pathname: string) =>
  pathname === '/start-session' || pathname === '/start-session/'

export const LiveSessionBanner = () => {
  const { inProgressSession, liveSessionRefreshFailed, endSession, isEnding } =
    useLiveSessionContext()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const hideOnCurrentRoute =
    pathname.startsWith('/end-session/') || isStartSessionRoute(pathname)

  const { elapsedTimerLabel, showStillSurfingPrompt, isPastExpectedReturn } =
    useLiveSessionElapsedTime({
      sessionStartInstant: inProgressSession?.sessionStartInstant,
      expectedReturnInstant: inProgressSession?.expectedReturnInstant,
    })

  const hasNamedSpot =
    inProgressSession?.surfSpotId != null &&
    inProgressSession.surfSpotName.trim() !== ''

  const headlineLabel = useMemo(() => {
    if (showStillSurfingPrompt) {
      return 'Still surfing?'
    }
    if (isPastExpectedReturn) {
      return 'Past your expected return time.'
    }
    if (hasNamedSpot) {
      return `Live surf session running at ${inProgressSession.surfSpotName}.`
    }
    return 'Surf session in progress.'
  }, [
    hasNamedSpot,
    inProgressSession?.surfSpotName,
    isPastExpectedReturn,
    showStillSurfingPrompt,
  ])

  const timerAriaLabel =
    elapsedTimerLabel !== '' ? `Time in the water: ${elapsedTimerLabel}` : ''

  const handleEndSession = () => {
    if (inProgressSession?.id == null || isEnding) {
      return
    }
    endSession(inProgressSession.id, {
      onSuccess: () => navigate(liveSessionDetailsPath(inProgressSession.id)),
    })
  }

  if (hideOnCurrentRoute || inProgressSession == null) {
    return null
  }

  return (
    <div
      className={classNames({
          'live-session-banner': true,
          'live-session-banner-reminder': showStillSurfingPrompt || isPastExpectedReturn
        })}
      role="status"
      aria-live="polite"
    >
      <div className="live-session-banner-content">
        <div className="live-session-banner-text">
          <p className="live-session-banner-headline bold m-0">{headlineLabel}</p>
          {elapsedTimerLabel !== '' && (
            <p className="live-session-banner-timer m-0" aria-label={timerAriaLabel}>
              <span className="live-session-banner-timer-icon" aria-hidden>
                <Icon iconKey="hourglass" useCurrentColor />
              </span>
              <span className="text-secondary">Time in the water:</span>
              <span className="live-session-banner-timer-value bold">
                {elapsedTimerLabel}
              </span>
            </p>
          )}
          {showStillSurfingPrompt && (
            <p className="live-session-banner-reminder-copy text-secondary m-0">
              Your session has been running for over 4 hours. End it when you are back.
            </p>
          )}
          {isPastExpectedReturn && !showStillSurfingPrompt && (
            <p className="live-session-banner-reminder-copy text-secondary m-0">
              End your session when you are back so your emergency contact knows you are safe.
            </p>
          )}
          {liveSessionRefreshFailed && (
            <p className="live-session-banner-reminder-copy font-small text-secondary m-0">
              Could not refresh session status. The timer may be out of date.
            </p>
          )}
        </div>
        <div className="live-session-banner-action">
          <Button
            label="End session"
            type="button"
            variant="primary"
            size="small"
            loading={isEnding}
            disabled={isEnding}
            onClick={handleEndSession}
          />
        </div>
      </div>
    </div>
  )
}

export default LiveSessionBanner
