import { Link } from '@remix-run/react'
import { BreadcrumbItem } from './index'

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
          return (
            <li key={index} className="breadcrumb-item center-vertical">
              {index < items.length - 1 ? (
                <Link to={link} className="breadcrumb-link">
                  {label}
                </Link>
              ) : (
                <span className="breadcrumb-current">{label}</span>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
