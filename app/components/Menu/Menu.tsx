import { useState } from 'react'
import { useNavigate } from 'react-router'

import { MenuItem, profileMenuItems, spotsMenuItems } from './index'
import { ErrorBoundary, Icon } from '../index'
import { useLayoutContext, useUserContext } from '~/contexts'
import { useAuthModal } from '~/hooks/useAuthModal'

const Menu = () => {
  const navigate = useNavigate()
  const { user } = useUserContext()
  const { openDrawer, closeDrawer } = useLayoutContext()
  const { showAuthModal, AuthModal } = useAuthModal()
  const [isDropdownOpen, setDropdownOpen] = useState(false)

  const toggleDropdown = () => setDropdownOpen((prev) => !prev)

  // Map of protected routes to their route identifiers
  const protectedRoutes: Record<
    string,
    'surfed-spots' | 'watch-list' | 'add-surf-spot'
  > = {
    '/surfed-spots': 'surfed-spots',
    '/watch-list': 'watch-list',
    '/add-surf-spot': 'add-surf-spot',
    '/add-surf-spots': 'add-surf-spot', // Handle plural variant
  }

  const handleMenuItemClick = (path: string) => {
    // Check if this is a protected route and user is not logged in
    const routeKey = protectedRoutes[path]
    if (routeKey && !user) {
      showAuthModal(routeKey)
      closeDrawer()
      return
    }

    navigate(path)
    closeDrawer()
  }

  const createMenuList = (items: MenuItem[], itemClass: string) => (
    <ul>
      {items.map((item: MenuItem) => {
        const { key, icon, label, path } = item
        return (
          <li
            key={key}
            className={itemClass}
            onClick={() => handleMenuItemClick(path)}
          >
            <Icon iconKey={icon} />
            {label}
          </li>
        )
      })}
    </ul>
  )

  const handleOpenMobileMenu = () => {
    const mobileMenuContent = (
      <div className="sidebar-menu">
        <div className="sidebar-content">
          <ErrorBoundary message="Unable to display menu">
            {createMenuList(spotsMenuItems, 'menu-item ph')}
            <div className="menu-section">
              {createMenuList(profileMenuItems, 'menu-item ph')}
            </div>
          </ErrorBoundary>
        </div>
      </div>
    )
    openDrawer(mobileMenuContent, 'right', '')
  }

  return (
    <nav className="menu" aria-label="Main navigation">
      {/* Desktop Menu */}
      <div className="desktop-menu">
        {createMenuList(spotsMenuItems, 'nav-item')}
        <button
          className="nav-item"
          onClick={toggleDropdown}
          aria-expanded={isDropdownOpen}
          aria-label="Open profile menu"
          type="button"
        >
          <Icon iconKey="profile" />
        </button>
      </div>
      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="dropdown-menu" role="menu">
          <ErrorBoundary message="Unable to display profile menu">
            {createMenuList(profileMenuItems, 'menu-item')}
          </ErrorBoundary>
        </div>
      )}
      {/* Hamburger Icon (Mobile) */}
      <button
        className="hamburger-icon"
        onClick={handleOpenMobileMenu}
        aria-label="Open mobile menu"
        type="button"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <AuthModal />
    </nav>
  )
}

export default Menu
