import { useEffect, useRef, useState } from 'react'
import { Link } from '@remix-run/react'
import { BreadcrumbItem, formatSlug } from './index'
import { debounce } from '~/utils'

interface IProps {
  items: BreadcrumbItem[]
}

export const Breadcrumb = ({ items }: IProps) => {
  const breadcrumbRef = useRef<HTMLUListElement>(null)
  const [collapsedItems, setCollapsedItems] = useState<BreadcrumbItem[]>(items)

  // Function to collapse the breadcrumb items based on available width
  const collapseBreadcrumbs = () => {
    const breadcrumbElement = breadcrumbRef.current
    if (!breadcrumbElement) return

    const maxWidth = breadcrumbElement.parentElement?.clientWidth || 0
    const breadcrumbWidth = breadcrumbElement.scrollWidth

    if (breadcrumbWidth > maxWidth && collapsedItems.length > 1) {
      setCollapsedItems((prevItems) => {
        const newItems = [...prevItems]
        // Change the second item to '...' if it's not already
        if (newItems[1].label !== '...') {
          newItems[1] = { ...newItems[1], link: '', label: '...' }
        } else {
          // Remove the next item after '...'
          newItems.splice(2, 1)
        }
        return newItems
      })
    }
  }

  // Check for overflow and collapse if necessary
  const checkAndCollapse = () => {
    const breadcrumbElement = breadcrumbRef.current
    if (!breadcrumbElement) return

    const maxWidth = breadcrumbElement.parentElement?.clientWidth || 0
    const breadcrumbWidth = breadcrumbElement.scrollWidth

    if (breadcrumbWidth > maxWidth) {
      collapseBreadcrumbs()
    }
  }

  // Set items and collapse on initial render or items change
  useEffect(() => {
    setCollapsedItems(items)
    checkAndCollapse()
  }, [items])

  // Debounce resize event
  useEffect(() => {
    const debouncedResize = debounce(() => checkAndCollapse(), 300)
    window.addEventListener('resize', debouncedResize)
    return () => window.removeEventListener('resize', debouncedResize)
  }, [])

  return (
    <nav aria-label="breadcrumb" className="breadcrumb">
      <ul className="breadcrumb-list" ref={breadcrumbRef}>
        {collapsedItems.map((item, index) => {
          const { label, link } = item
          const displayLabel = formatSlug(label)
          return (
            <li key={index} className="breadcrumb-item center-vertical">
              {index < collapsedItems.length - 1 && link ? (
                <Link to={link} className="breadcrumb-link">
                  {displayLabel}
                </Link>
              ) : (
                <span className="breadcrumb-current">{displayLabel}</span>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
