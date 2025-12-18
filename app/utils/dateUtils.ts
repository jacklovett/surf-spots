/**
 * Format a date string to a consistent display format
 * This ensures server and client render the same output
 * Format: "DD/MM/YYYY" (e.g., "25/12/2024")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Format a date as a relative time string (e.g., "5 minutes ago", "2 hours ago")
 * @param createdAt - ISO date string or undefined
 * @returns Formatted relative time string
 */
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