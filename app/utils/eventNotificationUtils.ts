/** Maps contest event status values to a short feed badge label. */
export const getEventStatusLabel = (status: string): string => {
  switch (status) {
    case 'ACTIVE':
      return 'Live now'
    case 'UPCOMING':
      return 'Waiting period'
    default:
      return 'Scheduled'
  }
}
