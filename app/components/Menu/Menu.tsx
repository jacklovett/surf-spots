import { useState } from 'react'
import { useNavigate } from 'react-router'

import { MenuItem, profileMenuItems, spotsMenuItems } from './index'
import { ErrorBoundary, Icon } from '../index'
import { useLayoutContext } from '~/contexts'

const Menu = () => {
  const navigate = useNavigate()
  const { openDrawer, closeDrawer } = useLayoutContext()
  const [isDropdownOpen, setDropdownOpen] = useState(false)

  const toggleDropdown = () => setDropdownOpen((prev) => !prev)

  const handleMenuItemClick = (path: string) => {
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
      {/* Hamburger Icon (Mobile) */}
      <div className="hamburger-icon" onClick={handleOpenMobileMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  )
}

export default Menu
