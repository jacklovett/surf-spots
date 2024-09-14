import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Icon, { IconKey } from '../Icon'
import ErrorBoundary from '../ErrorBoundary'

interface MenuItem {
  key: string
  icon: IconKey
  label: string
  path: string
}

const Menu = () => {
  const navigate = useNavigate()
  const [isDropdownOpen, setDropdownOpen] = useState(false)
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  const toggleDropdown = () => setDropdownOpen((prev) => !prev)
  const toggleSidebar = () => setSidebarOpen((prev) => !prev)

  const createMenuList = (items: MenuItem[], itemClass: string) => (
    <ul>
      {items.map((item: MenuItem) => {
        const { key, icon, label, path } = item
        return (
          <li className={itemClass} key={key} onClick={() => navigate(path)}>
            <Icon iconKey={icon} />
            {label}
          </li>
        )
      })}
    </ul>
  )

  const spotsMenuItems: MenuItem[] = [
    {
      key: 'my-surf-spots',
      icon: 'pin',
      label: 'Surfed Spots',
      path: '/my-surf-spots',
    },
    { key: 'wishlist', icon: 'heart', label: 'Wishlist', path: '/wishlist' },
  ]

  const profileMenuItems: MenuItem[] = [
    { key: 'profile', icon: 'profile', label: 'Profile', path: '/profile' },
    { key: 'settings', icon: 'cog', label: 'Settings', path: '/settings' },
    { key: 'logout', icon: 'logout', label: 'Logout', path: '/' },
  ]

  return (
    <div className="menu">
      <div className="desktop-menu">
        {createMenuList(spotsMenuItems, 'nav-item')}
        <div
          className="nav-item"
          onClick={toggleDropdown}
          aria-expanded={isDropdownOpen}
        >
          <Icon iconKey="profile" />
        </div>
      </div>

      {isDropdownOpen && (
        <div className="dropdown-menu">
          <ErrorBoundary message="Unable to display profile menu">
            {createMenuList(profileMenuItems, 'menu-item')}
          </ErrorBoundary>
        </div>
      )}

      {isSidebarOpen && (
        <div className="sidebar-menu">
          <div className="sidebar-header">
            <button onClick={toggleSidebar}>✕</button>
          </div>
          <ErrorBoundary message="Unable to display menu">
            {createMenuList(spotsMenuItems, 'menu-item')}
            <div className="menu-section">
              {createMenuList(profileMenuItems, 'menu-item')}
            </div>
          </ErrorBoundary>
        </div>
      )}

      <div className="hamburger-icon" onClick={toggleSidebar}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  )
}

export default Menu
