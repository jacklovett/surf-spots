import { useNavigate } from 'react-router'

import {
  profileMenuItems,
  spotsMenuItems,
  collectionMenuItems,
} from './index'
import { ErrorBoundary } from '../index'
import { ERROR_BOUNDARY_SECTION } from '~/utils/errorUtils'
import { MenuSection } from './MenuSection'
import { useLayoutContext, useUserContext } from '~/contexts'

const Menu = () => {
  const navigate = useNavigate()
  const { user } = useUserContext()
  const { openDrawer, closeDrawer } = useLayoutContext()

  // Map of protected routes to their route identifiers
  const protectedRoutes: Record<
    string,
    | 'surfed-spots'
    | 'watch-list'
    | 'add-surf-spot'
    | 'surfboards'
    | 'trips'
    | 'sessions'
  > = {
    '/surfed-spots': 'surfed-spots',
    '/watch-list': 'watch-list',
    '/add-surf-spot': 'add-surf-spot',
    '/surfboards': 'surfboards',
    '/trips': 'trips',
    '/sessions': 'sessions',
  }

  const handleMenuItemClick = (path: string) => {
    // Check if this is a protected route and user is not logged in
    const routeKey = protectedRoutes[path]
    if (routeKey && !user) {
      navigate('/auth')
      closeDrawer()
      return
    }

    navigate(path)
    closeDrawer()
  }

  const renderMenuContent = () => (
    <div className="menu-drawer-content">
      <ErrorBoundary message={ERROR_BOUNDARY_SECTION}>
        <MenuSection
          title="Spots"
          items={spotsMenuItems}
          onItemClick={handleMenuItemClick}
          defaultOpen
        />
        <MenuSection
          title="Collections"
          items={collectionMenuItems}
          onItemClick={handleMenuItemClick}
          defaultOpen
        />
        <MenuSection
          title="Account"
          items={profileMenuItems}
          onItemClick={handleMenuItemClick}
          defaultOpen
        />
      </ErrorBoundary>
    </div>
  )


  return (
    <nav className="menu" aria-label="Main navigation">
      {/* Hamburger Icon (Always visible) */}
        <button
          className="hamburger-icon"
        onClick={() => openDrawer(renderMenuContent(), 'right', '')
        }
          aria-label="Open menu"
          type="button"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
    </nav>
  )
}

export default Menu
