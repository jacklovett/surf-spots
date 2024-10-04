import { Link } from '@remix-run/react'
import { BreadcrumbItem, formatSlug } from './index'

interface IProps {
  items: BreadcrumbItem[]
}

export const Breadcrumb = (props: IProps) => {
  const { items } = props
  return (
    <nav aria-label="breadcrumb" className="breadcrumb">
      <ul className="breadcrumb-list">
        {items.map((item, index) => {
          const { label, link } = item
          const displayLabel = formatSlug(label)
          return (
            <li key={index} className="breadcrumb-item center-vertical">
              {index < items.length - 1 ? (
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
