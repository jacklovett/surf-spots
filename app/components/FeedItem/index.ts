import { FeedItem } from './FeedItem'

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
      return 'Swell Season'
    case 'promotion':
      return 'Deal'
    case 'hazard':
      return 'Warning'
    default:
      return 'Update'
  }
}

export const getDefaultImage = (type: string) => {
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

export default FeedItem
