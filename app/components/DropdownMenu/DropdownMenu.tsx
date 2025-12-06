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

  useClickOutside(
    containerRef,
    useCallback(() => setIsOpen(false), []),
    isOpen,
  )

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
            >
              {item.iconKey && <Icon iconKey={item.iconKey as IconKey} />}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default DropdownMenu
