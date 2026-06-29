import { FeedItem } from './FeedItem'
import { getEventStatusLabel } from '~/utils/eventNotificationUtils'

export const getNotificationIcon = (type: string) => {
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

export const getNotificationLabel = (type: string) => {
  switch (type) {
    case 'event':
      return 'Event'
    case 'swell':
      return 'Swell season'
    case 'promotion':
      return 'Deal'
    case 'hazard':
      return 'Alert'
    default:
      return 'Update'
  }
}

export const getFeedBadgeLabel = (type: string, status?: string): string => {
  if (type === 'event' && status) {
    return getEventStatusLabel(status)
  }
  return getNotificationLabel(type)
}

export default FeedItem
