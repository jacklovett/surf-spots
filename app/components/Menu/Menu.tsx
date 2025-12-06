import { useNavigate } from 'react-router'

import { MenuItem, profileMenuItems, spotsMenuItems } from './index'
import { DropdownMenu, ErrorBoundary, Icon } from '../index'
import { useLayoutContext, useUserContext } from '~/contexts'
import { useSignUpPrompt } from '~/hooks'

const Menu = () => {
  const navigate = useNavigate()
  const { user } = useUserContext()
  const { openDrawer, closeDrawer } = useLayoutContext()
  const { showSignUpPrompt, SignUpPromptModal } = useSignUpPrompt()

  // Map of protected routes to their route identifiers
  const protectedRoutes: Record<
    string,
    'surfed-spots' | 'watch-list' | 'add-surf-spot'
  > = {
    '/surfed-spots': 'surfed-spots',
    '/watch-list': 'watch-list',
    '/add-surf-spot': 'add-surf-spot',
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
        <ErrorBoundary message="Unable to display profile menu">
          <div className="profile-menu-wrapper">
            <DropdownMenu
              items={profileMenuItems.map((item) => ({
                label: item.label,
                iconKey: item.icon,
                onClick: () => handleMenuItemClick(item.path),
              }))}
              triggerIcon="profile"
              triggerClassName="nav-item"
              align="right"
            />
          </div>
        </ErrorBoundary>
      </div>
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
      <SignUpPromptModal />
    </nav>
  )
}

export default Menu
