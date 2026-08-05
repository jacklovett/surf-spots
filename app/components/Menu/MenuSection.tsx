import { useState } from 'react'
import { Icon } from '../index'
import { MenuItem } from './index'

interface MenuSectionProps {
  title: string
  items: MenuItem[]
  onItemClick: (item: MenuItem) => void
  hasAttention?: (menuKey: string) => boolean
  defaultOpen?: boolean
}

export const MenuSection = ({
  title,
  items,
  onItemClick,
  hasAttention,
  defaultOpen = true,
}: MenuSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const toggle = () => setIsOpen((previous) => !previous)

  const createMenuList = (sectionItems: MenuItem[]) => (
    <ul className="menu-list">
      {sectionItems.map((item: MenuItem) => {
        const { key, icon, label } = item
        const itemHasAttention = hasAttention?.(key) ?? false
        return (
          <li
            key={key}
            className="menu-item ph"
            onClick={() => onItemClick(item)}
            aria-label={
              itemHasAttention ? `${label}, has updates` : undefined
            }
          >
            <span className="menu-item-icon">
              <Icon iconKey={icon} />
              {itemHasAttention && (
                <span
                  className="menu-item-attention-dot"
                  data-testid={`menu-item-attention-dot-${key}`}
                  aria-hidden
                />
              )}
            </span>
            <span className="menu-item-label">{label}</span>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="menu-section">
      <button
        className="menu-section-header"
        onClick={(event) => {
          event.stopPropagation()
          toggle()
        }}
        aria-expanded={isOpen}
        type="button"
      >
        <span className="menu-section-title bold">{title}</span>
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
