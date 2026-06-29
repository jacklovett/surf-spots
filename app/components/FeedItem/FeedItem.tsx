import { Link } from 'react-router'
import type { WatchListNotification } from '~/types/watchedSurfSpotsSummary'
import Icon, { type IconKey } from '../Icon'
import { getFeedBadgeLabel, getNotificationIcon } from './index'
import { resolveNotificationLink } from '~/utils/commonUtils'
import { formatDateRange, formatTimeAgo } from '~/utils/dateUtils'

interface FeedItemProps {
  notification: WatchListNotification
}

export const FeedItem = ({ notification }: FeedItemProps) => {
  const {
    title,
    description,
    type,
    link,
    surfSpotName,
    startDate,
    endDate,
    status,
    createdAt,
  } = notification

  const iconKey = getNotificationIcon(type) as IconKey
  const badgeLabel = getFeedBadgeLabel(type, status)
  const timeAgo = formatTimeAgo(createdAt)
  const dateRange =
    startDate && endDate ? formatDateRange(startDate, endDate) : null
  const { externalHref, internalPath } = resolveNotificationLink(link)
  const isClickable = Boolean(externalHref || internalPath)
  const spotLabel = surfSpotName || 'Watch list'

  const body = (
    <>
      <div className="feed-item-banner feed-item-banner-default">
        <div className="feed-item-banner-overlay">
          <div className="feed-item-badge">{badgeLabel}</div>
        </div>
      </div>
      <div className="feed-item-body">
        <div className="feed-item-row">
          <div className="feed-item-avatar">
            <Icon iconKey={iconKey} useAccentColor={false} />
          </div>
          <div className="feed-item-main">
            <div className="feed-item-topline">
              <span className="feed-item-spot bold">{spotLabel}</span>
              {timeAgo && (
                <span className="feed-item-time text-secondary font-small">
                  {timeAgo}
                </span>
              )}
            </div>
            <p className="feed-item-headline bold">{title}</p>
            {dateRange && (
              <p className="feed-item-date-range font-small">{dateRange}</p>
            )}
            {description && (
              <p className="feed-item-body-text text-secondary font-small">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )

  return (
    <article className="feed-item animate-on-scroll" data-type={type}>
      {internalPath && (
        <Link to={internalPath} className="feed-item-link-wrapper">
          {body}
        </Link>
      )}
      {!internalPath && externalHref && (
        <a
          href={externalHref}
          target="_blank"
          rel="noopener noreferrer"
          className="feed-item-link-wrapper"
        >
          {body}
        </a>
      )}
      {!isClickable && <div className="feed-item-static">{body}</div>}
    </article>
  )
}
