import { CSSProperties } from 'react'
import type { WatchListNotification } from '~/types/watchedSurfSpotsSummary'
import Icon, { type IconKey } from '../Icon'
import {
  getNotificationIcon,
  getNotificationLabel,
  getDefaultImage,
  formatTimeAgo,
} from './index'

interface FeedItemProps {
  notification: WatchListNotification
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
            style={
              typeof bannerImage === 'string' &&
              bannerImage.startsWith('linear-gradient')
                ? ({ '--banner-image': bannerImage } as CSSProperties)
                : ({ '--banner-image': `url(${bannerImage})` } as CSSProperties)
            }
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
            style={
              typeof bannerImage === 'string' &&
              bannerImage.startsWith('linear-gradient')
                ? ({ '--banner-image': bannerImage } as CSSProperties)
                : ({
                    '--banner-image': `url(${bannerImage})`,
                  } as React.CSSProperties)
            }
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
