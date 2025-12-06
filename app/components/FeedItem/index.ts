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

export const formatTimeAgo = (createdAt?: string): string => {
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

export default FeedItem
