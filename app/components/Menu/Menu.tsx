import { useNavigate } from 'react-router'

import {
  profileMenuItems,
  spotsMenuItems,
  collectionMenuItems,
  infoMenuItems,
  type MenuItem,
} from './index'
import { ErrorBoundary } from '../index'
import { ERROR_BOUNDARY_SECTION } from '~/utils/errorUtils'
import { scrollPageToTop } from '~/utils/scrollPageToTop'
import { MenuSection } from './MenuSection'
import { useLayoutContext, useUserContext } from '~/contexts'
import { useMenuAttention } from '~/hooks'

const MenuDrawerContent = ({
  onItemClick,
}: {
  onItemClick: (item: MenuItem) => void
}) => {
  const { hasAttention, markSeen } = useMenuAttention()

  const handleItemClick = (item: MenuItem) => {
    markSeen(item.key)
    onItemClick(item)
  }

  return (
    <div className="menu-drawer-content">
      <ErrorBoundary message={ERROR_BOUNDARY_SECTION}>
        <MenuSection
          title="Spots"
          items={spotsMenuItems}
          onItemClick={handleItemClick}
          hasAttention={hasAttention}
          defaultOpen
        />
        <MenuSection
          title="Collections"
          items={collectionMenuItems}
          onItemClick={handleItemClick}
          hasAttention={hasAttention}
          defaultOpen
        />
        <MenuSection
          title="Account"
          items={profileMenuItems}
          onItemClick={handleItemClick}
          hasAttention={hasAttention}
          defaultOpen
        />
        <MenuSection
          title="Info"
          items={infoMenuItems}
          onItemClick={handleItemClick}
          hasAttention={hasAttention}
          defaultOpen
        />
      </ErrorBoundary>
    </div>
  )
}

const Menu = () => {
  const navigate = useNavigate()
  const { user } = useUserContext()
  const { openDrawer, closeDrawer } = useLayoutContext()
  const { hasAny } = useMenuAttention()

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

  const handleMenuItemClick = (item: MenuItem) => {
    const routeKey = protectedRoutes[item.path]
    if (routeKey && !user) {
      navigate('/auth')
      closeDrawer()
      return
    }

    scrollPageToTop()
    navigate(item.path)
    closeDrawer()
  }

  return (
    <nav className="menu" aria-label="Main navigation">
      <button
        className="hamburger-icon"
        onClick={() =>
          openDrawer(
            <MenuDrawerContent onItemClick={handleMenuItemClick} />,
            'right',
            '',
          )
        }
        aria-label={hasAny ? 'Open menu, has updates' : 'Open menu'}
        type="button"
      >
        <span></span>
        <span></span>
        <span></span>
        {hasAny && (
          <span
            className="menu-attention-dot"
            data-testid="menu-attention-dot"
            aria-hidden
          />
        )}
      </button>
    </nav>
  )
}

export default Menu
