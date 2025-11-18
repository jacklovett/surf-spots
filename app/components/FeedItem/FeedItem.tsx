import type { WatchListNotification } from '~/types/watchedSurfSpotsSummary'
import Icon, { type IconKey } from '../Icon'

interface FeedItemProps {
  notification: WatchListNotification
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'event':
      return 'surfboard'
    case 'swell':
      return 'map'
    case 'promotion':
      return 'heart'
    case 'hazard':
      return 'error'
    default:
      return 'info'
  }
}

const getNotificationLabel = (type: string) => {
  switch (type) {
    case 'event':
      return 'Event'
    case 'swell':
      return 'Swell Season'
    case 'promotion':
      return 'Deal'
    case 'hazard':
      return 'Warning'
    default:
      return 'Update'
  }
}

const getDefaultImage = (type: string) => {
  // Return gradient-based placeholder images based on type
  switch (type) {
    case 'event':
      return 'linear-gradient(135deg, #3fc1c9 0%, #046380 100%)'
    case 'swell':
      return 'linear-gradient(135deg, #046380 0%, #20c6f8 100%)'
    case 'promotion':
      return 'linear-gradient(135deg, #ff9800 0%, #ff6b35 100%)'
    case 'hazard':
      return 'linear-gradient(135deg, #ea4335 0%, #c62828 100%)'
    default:
      return 'linear-gradient(135deg, #666666 0%, #333333 100%)'
  }
}

const formatTimeAgo = (createdAt?: string): string => {
  if (!createdAt) {
    // Generate random time for demo purposes
    const times = [
      'Just now',
      '5 minutes ago',
      '15 minutes ago',
      '1 hour ago',
      '2 hours ago',
      '5 hours ago',
      'Yesterday',
      '2 days ago',
      '3 days ago',
      '1 week ago',
    ]
    return times[Math.floor(Math.random() * times.length)]
  }

  const now = new Date()
  const created = new Date(createdAt)
  const diffMs = now.getTime() - created.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
}

export const FeedItem = ({ notification }: FeedItemProps) => {
  const {
    title,
    description,
    type,
    link,
    imageUrl,
    location,
    surfSpotName,
    createdAt,
  } = notification
  const iconKey = getNotificationIcon(type) as IconKey
  const label = getNotificationLabel(type)
  const bannerImage = imageUrl || getDefaultImage(type)
  const timeAgo = formatTimeAgo(createdAt)

  return (
    <article className="feed-item animate-on-scroll" data-type={type}>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="feed-item-link-wrapper"
        >
          <div
            className="feed-item-banner"
            style={{
              backgroundImage:
                typeof bannerImage === 'string' &&
                bannerImage.startsWith('linear-gradient')
                  ? bannerImage
                  : `url(${bannerImage})`,
            }}
          >
            <div className="feed-item-banner-overlay">
              <div className="feed-item-badge">{label}</div>
            </div>
          </div>
          <div className="feed-item-body">
            <div className="feed-item-header">
              <div className="feed-item-icon">
                <Icon iconKey={iconKey} useAccentColor={false} />
              </div>
              <div className="feed-item-meta">
                {(surfSpotName || location) && (
                  <span className="feed-item-location">
                    {surfSpotName || location}
                  </span>
                )}
                <span className="feed-item-time">{timeAgo}</span>
              </div>
            </div>
            <div className="feed-item-content">
              <h3 className="feed-item-title">{title}</h3>
              <p className="feed-item-description">{description}</p>
              <span className="feed-item-cta">View Details →</span>
            </div>
          </div>
        </a>
      ) : (
        <>
          <div
            className="feed-item-banner"
            style={{
              backgroundImage:
                typeof bannerImage === 'string' &&
                bannerImage.startsWith('linear-gradient')
                  ? bannerImage
                  : `url(${bannerImage})`,
            }}
          >
            <div className="feed-item-banner-overlay">
              <div className="feed-item-badge">{label}</div>
            </div>
          </div>
          <div className="feed-item-body">
            <div className="feed-item-header">
              <div className="feed-item-icon">
                <Icon iconKey={iconKey} useAccentColor={false} />
              </div>
              <div className="feed-item-meta">
                {(surfSpotName || location) && (
                  <span className="feed-item-location">
                    {surfSpotName || location}
                  </span>
                )}
                <span className="feed-item-time">{timeAgo}</span>
              </div>
            </div>
            <div className="feed-item-content">
              <h3 className="feed-item-title">{title}</h3>
              <p className="feed-item-description">{description}</p>
            </div>
          </div>
        </>
      )}
    </article>
  )
}
