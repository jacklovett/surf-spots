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
