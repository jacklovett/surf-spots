import { useState, useRef, useCallback } from 'react'
import classNames from 'classnames'
import Icon, { IconKey } from '../Icon'
import { useClickOutside } from '~/hooks'
import { DropdownMenuItem } from './index'

interface DropdownMenuProps {
  items: DropdownMenuItem[]
  triggerIcon?: IconKey
  className?: string
  triggerClassName?: string
  align?: 'left' | 'right'
  useCurrentColor?: boolean
}

export const DropdownMenu = (props: DropdownMenuProps) => {
  const {
    items,
    triggerIcon = 'more',
    className,
    triggerClassName,
    align = 'right',
    useCurrentColor = false,
  } = props
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setIsOpen(false), [])

  useClickOutside(containerRef, close, isOpen)

  const handleItemClick = (item: DropdownMenuItem) => {
    if (!item.disabled) {
      item.onClick()
      if (item.closeOnClick !== false) {
        setIsOpen(false)
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className={classNames('dropdown-menu-wrapper', className)}
    >
      <button
        type="button"
        className={`dropdown-menu-trigger ${triggerClassName || ''}`.trim()}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        <Icon
          iconKey={triggerIcon as IconKey}
          useCurrentColor={useCurrentColor}
        />
      </button>
      {isOpen && (
        <div
          className={classNames('dropdown-menu', {
            'align-left': align === 'left',
            'align-right': align === 'right',
          })}
        >
          {items.map((item, index) => (
            <button
              key={index}
              type="button"
              className={classNames('dropdown-menu-item', {
                disabled: item.disabled,
              })}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              aria-busy={item.loading}
            >
              <span className="dropdown-menu-item-icon-slot" aria-hidden="true">
                {item.loading ? (
                  <span className="button-loading-spinner dropdown-menu-item-spinner" />
                ) : (
                  item.iconKey && <Icon iconKey={item.iconKey as IconKey} />
                )}
              </span>
              <span className="dropdown-menu-item-label">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default DropdownMenu
