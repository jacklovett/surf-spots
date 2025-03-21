import { useState } from 'react'
import { useNavigate } from 'react-router';
import classNames from 'classnames'

import { MenuItem, profileMenuItems, spotsMenuItems } from './index'
import { ErrorBoundary, Icon } from '../index'

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
      {/* Desktop Menu */}
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
      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="dropdown-menu">
          <ErrorBoundary message="Unable to display profile menu">
            {createMenuList(profileMenuItems, 'menu-item')}
          </ErrorBoundary>
        </div>
      )}
      {/* Sidebar Menu */}
      <div
        className={classNames({
          'sidebar-menu': true,
          active: isSidebarOpen,
        })}
      >
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
      {/* Hamburger Icon (Mobile) */}
      <div className="hamburger-icon" onClick={toggleSidebar}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  )
}

export default Menu
