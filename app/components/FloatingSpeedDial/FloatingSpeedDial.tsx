import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'
import classNames from 'classnames'

import FloatingButton from '../FloatingButton'
import Icon, { IconKey } from '../Icon'
import { useUserContext } from '~/contexts'

// Routes where the quick-add dial is relevant — new content routes must be opted in here
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
]

const shouldShowDial = (pathname: string) =>
  CONTENT_PATH_PREFIXES.some(prefix => pathname.startsWith(prefix)) &&
  !/\/session\/?$/.test(pathname)

interface SpeedDialAction {
  label: string
  iconKey: IconKey
  to: string
  ariaLabel: string
}

const SPEED_DIAL_ACTIONS: SpeedDialAction[] = [
  { label: 'Add Surf Spot', iconKey: 'pin', to: '/add-surf-spot', ariaLabel: 'Add surf spot' },
  { label: 'Add Surfboard', iconKey: 'surfboard', to: '/add-surfboard', ariaLabel: 'Add surfboard' },
  { label: 'Add Trip', iconKey: 'plane', to: '/add-trip', ariaLabel: 'Add trip' },
  { label: 'Add Session', iconKey: 'stopwatch', to: '/sessions', ariaLabel: 'Go to sessions' },
]

export const FloatingSpeedDial = () => {
  const { user } = useUserContext()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const toggle = () => setIsOpen(prev => !prev)
  const close = () => setIsOpen(false)

  const handleAction = (to: string) => {
    close()
    navigate(to)
  }

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  if (!user || !shouldShowDial(pathname)) return null

  return (
    <div className={classNames('floating-speed-dial', { open: isOpen })}>
      {isOpen && (
        <button
          className="speed-dial-backdrop"
          onClick={close}
          aria-label="Close quick add menu"
          type="button"
        />
      )}
      <div className="speed-dial-container">
        <ul
          className="speed-dial-actions"
          role="menu"
          aria-label="Quick add options"
        >
          {SPEED_DIAL_ACTIONS.map((action, index) => (
            <li
              key={action.to}
              role="none"
              className="speed-dial-action"
              style={{ '--action-index': index } as React.CSSProperties}
            >
              <span className="speed-dial-action-label">{action.label}</span>
              <button
                type="button"
                role="menuitem"
                className="speed-dial-action-btn"
                onClick={() => handleAction(action.to)}
                aria-label={action.ariaLabel}
                tabIndex={isOpen ? 0 : -1}
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
