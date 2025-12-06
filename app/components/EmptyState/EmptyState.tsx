import { useNavigate } from 'react-router'
import Button from '../Button'

interface EmptyStateProps {
  title: string
  description: string
  ctaText: string
  ctaHref: string
}

export const EmptyState = ({
  title,
  description,
  ctaText,
  ctaHref,
}: EmptyStateProps) => {
  const navigate = useNavigate()

  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="empty-actions">
        <Button
          label={ctaText}
          onClick={() => navigate(ctaHref)}
          variant="primary"
        />
      </div>
    </div>
  )
}
