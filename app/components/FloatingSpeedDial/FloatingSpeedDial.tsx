import { useState, useEffect, useRef, CSSProperties, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router'
import classNames from 'classnames'

import FloatingButton from '../FloatingButton'
import Icon, { IconKey } from '../Icon'
import { POST_AUTH_REDIRECT_PATH } from '~/constants/postAuthRedirect'
import { liveSessionDetailsPath } from '~/constants/liveSessionPaths'
import { useLiveSessionContext, useUserContext } from '~/contexts'
import { useClickOutside, useEndLiveSession } from '~/hooks'

const CONTENT_PATH_PREFIXES = [
  '/surf-spots',
  '/surfboards',
  '/surfboard',
  '/trips',
  '/trip',
  '/sessions',
  '/surfed-spots',
  '/watch-list',
  '/add-',
  '/edit-',
  '/start-session',
]

const shouldShowDial = (pathname: string, hasInProgressSession: boolean) => {
  if (/^\/end-session\//.test(pathname)) {
    return false
  }
  if (hasInProgressSession && (pathname === '/start-session' || pathname === '/start-session/')) {
    return false
  }
  return CONTENT_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

interface SpeedDialAction {
  label: string
  iconKey: IconKey
  to?: string
  onClick?: () => void
  ariaLabel: string
}

const BASE_SPEED_DIAL_ACTIONS: SpeedDialAction[] = [
  { label: 'Surf Spot', iconKey: 'pin', to: '/add-surf-spot', ariaLabel: 'Add surf spot' },
  { label: 'Trip', iconKey: 'plane', to: '/add-trip', ariaLabel: 'Add trip' },
  { label: 'Surfboard', iconKey: 'surfboard', to: '/add-surfboard', ariaLabel: 'Add surfboard' },
]

export const FloatingSpeedDial = () => {
  const { user } = useUserContext()
  const { inProgressSession } = useLiveSessionContext()
  const { endSession, isEnding } = useEndLiveSession()
  const [isOpen, setIsOpen] = useState(false)
  const dialRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const speedDialActions = useMemo(() => {
    const sessionAction: SpeedDialAction = inProgressSession
      ? {
          label: 'End session',
          iconKey: 'stopwatch',
          onClick: () => {
            if (inProgressSession.id != null && !isEnding) {
              endSession(inProgressSession.id, {
                onSuccess: () =>
                  navigate(liveSessionDetailsPath(inProgressSession.id)),
              })
            }
          },
          ariaLabel: 'End live surf session',
        }
      : {
          label: 'Start session',
          iconKey: 'stopwatch',
          to: '/start-session',
          ariaLabel: 'Start live surf session',
        }

    return [...BASE_SPEED_DIAL_ACTIONS, sessionAction]
  }, [endSession, inProgressSession, isEnding, navigate])

  const toggle = () => setIsOpen((previous) => !previous)
  const close = () => setIsOpen(false)

  const handleAction = (action: SpeedDialAction) => {
    close()
    if (action.onClick != null) {
      action.onClick()
      return
    }
    if (action.to === '/start-session' && inProgressSession != null) {
      navigate(POST_AUTH_REDIRECT_PATH)
      return
    }
    if (action.to != null) {
      navigate(action.to)
    }
  }

  useClickOutside(dialRef, close, isOpen)

  useEffect(() => {
    if (!isOpen) {
      return
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  if (!user || !shouldShowDial(pathname, inProgressSession != null)) {
    return null
  }

  return (
    <div
      ref={dialRef}
      className={classNames('floating-speed-dial', { open: isOpen })}
    >
      <div className="speed-dial-container">
        <ul
          className="speed-dial-actions"
          role="menu"
          aria-label="Quick add options"
        >
          {speedDialActions.map((action, index) => (
            <li
              key={action.label}
              role="none"
              className="speed-dial-action"
              style={{ '--action-index': index } as CSSProperties}
            >
              <span className="speed-dial-action-label">{action.label}</span>
              <button
                type="button"
                role="menuitem"
                className="speed-dial-action-btn"
                onClick={() => handleAction(action)}
                aria-label={action.ariaLabel}
                tabIndex={isOpen ? 0 : -1}
                disabled={action.label === 'End session' && isEnding}
              >
                <span className="speed-dial-action-icon">
                  <Icon iconKey={action.iconKey} useCurrentColor />
                </span>
              </button>
            </li>
          ))}
        </ul>
        <FloatingButton
          iconKey="plus"
          onClick={toggle}
          ariaLabel={isOpen ? 'Close quick add menu' : 'Open quick add menu'}
          size="medium"
          className="speed-dial-trigger"
        />
      </div>
    </div>
  )
}

export default FloatingSpeedDial
