import { useState } from 'react'
import { useNavigate } from '@remix-run/react'

import Icon from '../Icon'
import ErrorBoundary from '../ErrorBoundary'
import { MenuItem, profileMenuItems, spotsMenuItems } from './index'

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
          <li key={key} className={itemClass} onClick={() => navigate(path)}>
            <Icon iconKey={icon} />
            {label}
          </li>
        )
      })}
    </ul>
  )

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
            <div className="sidebar-content">
              {createMenuList(spotsMenuItems, 'menu-item')}
              <div className="menu-section">
                {createMenuList(profileMenuItems, 'menu-item')}
              </div>
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
