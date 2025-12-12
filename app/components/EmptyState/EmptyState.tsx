import Button from '../Button'

interface EmptyStateProps {
  title: string
  description: string
  ctaText: string
  onCtaClick?: () => void
}

export const EmptyState = ({
  title,
  description,
  ctaText,
  onCtaClick,
}: EmptyStateProps) => {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="empty-actions">
        <Button label={ctaText} onClick={onCtaClick} variant="primary" />
      </div>
    </div>
  )
}
