import { useNavigate } from 'react-router'

import {
  profileMenuItems,
  spotsMenuItems,
  collectionMenuItems,
} from './index'
import { ErrorBoundary } from '../index'
import { MenuSection } from './MenuSection'
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

  const renderMenuContent = () => (
    <div className="menu-drawer-content">
      <ErrorBoundary message="Unable to display menu">
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
      <SignUpPromptModal />
    </nav>
  )
}

export default Menu
