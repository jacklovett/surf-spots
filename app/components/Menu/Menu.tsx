import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'

import {
  MenuItem,
  MenuSection,
  profileMenuItems,
  spotsMenuItems,
  collectionMenuItems,
} from './index'
import { ErrorBoundary, Icon } from '../index'
import { useLayoutContext, useUserContext } from '~/contexts'
import { useSignUpPrompt } from '~/hooks'

const Menu = () => {
  const navigate = useNavigate()
  const { user } = useUserContext()
  const { openDrawer, closeDrawer, drawer } = useLayoutContext()
  const { showSignUpPrompt, SignUpPromptModal } = useSignUpPrompt()

  // Map of protected routes to their route identifiers
  const protectedRoutes: Record<
    string,
    'surfed-spots' | 'watch-list' | 'add-surf-spot' | 'surfboards' | 'trips'
  > = {
    '/surfed-spots': 'surfed-spots',
    '/watch-list': 'watch-list',
    '/add-surf-spot': 'add-surf-spot',
    '/surfboards': 'surfboards',
    '/trips': 'trips',
  }

  const handleMenuItemClick = (path: string) => {
    // Check if this is a protected route and user is not logged in
    const routeKey = protectedRoutes[path]
    if (routeKey && !user) {
      showSignUpPrompt(routeKey)
      closeDrawer()
      return
    }

    navigate(path)
    closeDrawer()
  }

  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['spots', 'collections', 'account']),
  )

  const toggleSection = (section: string) =>
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })

  const createMenuList = (items: MenuItem[]) => (
    <ul className="menu-list">
      {items.map((item: MenuItem) => {
        const { key, icon, label, path } = item
        return (
          <li
            key={key}
            className="menu-item ph"
            onClick={() => handleMenuItemClick(path)}
          >
            <Icon iconKey={icon} />
            {label}
          </li>
        )
      })}
    </ul>
  )

  const MenuSection = ({ id, title, items, isOpen, onToggle }: MenuSection) => (
    <div className="menu-section">
      <button
        className="menu-section-header"
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        aria-expanded={isOpen}
        type="button"
      >
        <span className="menu-section-title">{title}</span>
        <span className={`menu-section-icon ${isOpen ? 'open' : ''}`}>
          <Icon iconKey="chevron-down" useCurrentColor />
        </span>
      </button>
      <div className={`menu-section-content ${isOpen ? 'open' : ''}`}>
        <div>{createMenuList(items)}</div>
      </div>
    </div>
  )

  const renderMenuContent = () => (
    <div className="menu-drawer-content">
      <ErrorBoundary message="Unable to display menu">
        <MenuSection
          id="spots"
          title="Spots"
          items={spotsMenuItems}
          isOpen={openSections.has('spots')}
          onToggle={() => toggleSection('spots')}
        />
        <MenuSection
          id="collections"
          title="Collections"
          items={collectionMenuItems}
          isOpen={openSections.has('collections')}
          onToggle={() => toggleSection('collections')}
        />
        <MenuSection
          id="account"
          title="Account"
          items={profileMenuItems}
          isOpen={openSections.has('account')}
          onToggle={() => toggleSection('account')}
        />
      </ErrorBoundary>
    </div>
  )

  // Update drawer content when openSections changes (if drawer is open)
  useEffect(() => {
    if (drawer.isOpen) {
      const menuContent = (
        <div className="menu-drawer-content pb">
          <ErrorBoundary message="Unable to display menu">
            <MenuSection
              id="spots"
              title="Spots"
              items={spotsMenuItems}
              isOpen={openSections.has('spots')}
              onToggle={() => toggleSection('spots')}
            />
            <MenuSection
              id="collections"
              title="Collections"
              items={collectionMenuItems}
              isOpen={openSections.has('collections')}
              onToggle={() => toggleSection('collections')}
            />
            <MenuSection
              id="account"
              title="Account"
              items={profileMenuItems}
              isOpen={openSections.has('account')}
              onToggle={() => toggleSection('account')}
            />
          </ErrorBoundary>
        </div>
      )
      openDrawer(menuContent, 'right', '')
    }
  }, [openSections, drawer.isOpen])

  const handleOpenMenu = () => openDrawer(renderMenuContent(), 'right', '')

  return (
    <nav className="menu" aria-label="Main navigation">
      {/* Hamburger Icon (Always visible) */}
      <button
        className="hamburger-icon"
        onClick={handleOpenMenu}
        aria-label="Open menu"
        type="button"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <SignUpPromptModal />
    </nav>
  )
}

export default Menu
