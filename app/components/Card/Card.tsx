import { ReactNode } from 'react'

interface CardProps {
  imageUrl?: string
  imageAlt?: string
  title: string
  children?: ReactNode
  onClick?: () => void
  className?: string
}

export const Card = ({
  imageUrl,
  imageAlt,
  title,
  children,
  onClick,
  className = '',
}: CardProps) => {
  return (
    <div
      className={`card animate-on-scroll ${className}`}
      onClick={onClick}
    >
      {imageUrl && (
        <div className="card-image">
          <img src={imageUrl} alt={imageAlt || title} />
        </div>
      )}
      <h3>{title}</h3>
      {children}
    </div>
  )
}

