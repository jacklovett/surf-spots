import FloatingButton from '../FloatingButton'

interface TripPlannerButtonProps {
  onOpenTripPlanner: () => void
  isLoading?: boolean
}

export const TripPlannerButton = (props: TripPlannerButtonProps) => {
  const { onOpenTripPlanner, isLoading = false } = props

  return (
    <div className="floating-trip-planner-button">
      <FloatingButton
        iconKey="ai"
        onClick={onOpenTripPlanner}
        ariaLabel="Trip Planner, coming soon"
        size="large"
        loading={isLoading}
      />
    </div>
  )
}

export default TripPlannerButton
