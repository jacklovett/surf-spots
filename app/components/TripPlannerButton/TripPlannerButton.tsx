import TextButton from '../TextButton'

interface TripPlannerButtonProps {
  onOpenTripPlanner: () => void
}

export const TripPlannerButton = (props: TripPlannerButtonProps) => {
  const { onOpenTripPlanner } = props

  return (
    <div className="floating-trip-planner-button">
      <TextButton
        text="Trip Planner"
        onClick={onOpenTripPlanner}
        iconKey="ai"
        filled
      />
    </div>
  )
}

export default TripPlannerButton
