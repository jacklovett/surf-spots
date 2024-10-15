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

    const collapsed = [...collapsedItems]

    // Collapse one item at a time if needed
    if (breadcrumbWidth > maxWidth && collapsed.length > 1) {
      // Check if it's the first collapse; if so, change it to '...'
      if (collapsed[1].label !== '...') {
        collapsed[1] = { ...collapsed[1], label: '...' }
      } else {
        collapsed.splice(2, 1) // Remove the next item after '...'
      }

      setCollapsedItems(collapsed)
    }
  }

  // Recalculate width after state updates and collapse if necessary
  useEffect(() => {
    const breadcrumbElement = breadcrumbRef.current
    if (!breadcrumbElement) return

    const maxWidth = breadcrumbElement.parentElement?.clientWidth || 0
    const breadcrumbWidth = breadcrumbElement.scrollWidth

    // Trigger another collapse if it still overflows
    if (breadcrumbWidth > maxWidth) {
      collapseBreadcrumbs()
    }
  }, [collapsedItems])

  useEffect(() => {
    setCollapsedItems(items)
    collapseBreadcrumbs()

    const debouncedResize = debounce(() => {
      setCollapsedItems(items)
      collapseBreadcrumbs()
    }, 500)

    // Listen for window resize and collapse breadcrumbs accordingly
    window.addEventListener('resize', debouncedResize)
    return () => window.removeEventListener('resize', debouncedResize)
  }, [items])

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
