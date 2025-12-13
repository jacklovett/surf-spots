import { Trip } from '~/types/trip'
import { TextButton } from '~/components'
import { formatDate } from '~/utils/dateUtils'

interface TripSelectionItemProps {
  trip: Trip
  isSpotInTrip: (trip: Trip) => boolean
  isAdding: boolean
  isRemoving: boolean
  onSelect: (tripId: string) => void
}

export const TripSelectionItem = ({
  trip,
  isSpotInTrip,
  isAdding,
  isRemoving,
  onSelect,
}: TripSelectionItemProps) => {
  const alreadyAdded = isSpotInTrip(trip)

  return (
    <div className="trip-selection-item">
      <div className="trip-selection-item-info">
        <div className="trip-selection-item-header">
          <h3>{trip.title}</h3>
          {alreadyAdded && (
            <span className="status-badge added bold">Added</span>
          )}
        </div>
        {trip.startDate && trip.endDate && (
          <p className="trip-dates">
            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
          </p>
        )}
        {trip.description && (
          <p className="text-secondary">{trip.description}</p>
        )}
        <div className="trip-selection-item-action">
          {isAdding ? (
            <span className="status-text bold">Adding...</span>
          ) : isRemoving ? (
            <span className="status-text bold">Removing...</span>
          ) : alreadyAdded ? (
            <TextButton
              text="Remove"
              iconKey="bin"
              onClick={() => onSelect(trip.id)}
              filled
            />
          ) : (
            <TextButton
              text="Add"
              iconKey="plus"
              onClick={() => onSelect(trip.id)}
              filled
            />
          )}
        </div>
      </div>
    </div>
  )
}
