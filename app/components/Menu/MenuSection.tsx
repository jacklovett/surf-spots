import { useState } from 'react'
import { Icon } from '../index'
import { MenuItem } from './index'

interface MenuSectionProps {
  title: string
  items: MenuItem[]
  onItemClick: (path: string) => void
  defaultOpen?: boolean
}

export const MenuSection = ({
  title,
  items,
  onItemClick,
  defaultOpen = true,
}: MenuSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const toggle = () => 
    setIsOpen((prev) => !prev)

  const createMenuList = (items: MenuItem[]) => (
    <ul className="menu-list">
      {items.map((item: MenuItem) => {
        const { key, icon, label, path } = item
        return (
          <li
            key={key}
            className="menu-item ph"
            onClick={() => onItemClick(path)}
          >
            <Icon iconKey={icon} />
            {label}
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="menu-section">
      <button
        className="menu-section-header"
        onClick={(e) => {
          e.stopPropagation()
          toggle()
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
}