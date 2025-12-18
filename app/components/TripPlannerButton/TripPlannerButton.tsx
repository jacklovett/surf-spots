import FloatingButton from '../FloatingButton'

interface TripPlannerButtonProps {
  onOpenTripPlanner: () => void
}

export const TripPlannerButton = (props: TripPlannerButtonProps) => {
  const { onOpenTripPlanner } = props

  return (
    <div className="floating-trip-planner-button">
      <FloatingButton
        iconKey="ai"
        onClick={onOpenTripPlanner}
        ariaLabel="Open Trip Planner"
        size="large"
      />
    </div>
  )
}

export default TripPlannerButton
