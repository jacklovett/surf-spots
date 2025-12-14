import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useFetcher } from 'react-router'
import { Modal, Button, Loading } from '~/components'
import { useTripContext } from '~/contexts'
import { Trip, TripSpot } from '~/types/trip'
import { SurfSpot } from '~/types/surfSpots'
import { TripSelectionItem } from './TripSelectionItem'

interface TripSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onError: (title: string, message: string) => void
  surfSpot: SurfSpot
  userId: string
}

export const TripSelectionModal = ({
  isOpen,
  onClose,
  onError,
  surfSpot,
  userId,
}: TripSelectionModalProps) => {
  const navigate = useNavigate()
  const fetcher = useFetcher<{ error?: string; success?: boolean }>()
  const { trips, fetchTrips, setTrips } = useTripContext()
  const [isLoadingTrips, setIsLoadingTrips] = useState(false)
  const [addingToTripId, setAddingToTripId] = useState<string | null>(null)
  const [removingFromTripId, setRemovingFromTripId] = useState<string | null>(
    null,
  )

  // Handle fetcher responses
  useEffect(() => {
    if (fetcher.data?.error) {
      onError('Error', fetcher.data.error)
      // Refetch trips to get accurate state
      if (userId) {
        fetchTrips(userId)
      }
    } else if (fetcher.data?.success && fetcher.state === 'idle') {
      // Refetch trips to get updated data
      if (userId) {
        fetchTrips(userId)
      }
    }
  }, [fetcher.data, fetcher.state, userId, fetchTrips, onError])

  const isSpotInTrip = useCallback(
    (trip: Trip) =>
      trip.spots?.some((s) => s.surfSpotId === Number(surfSpot.id)) ?? false,
    [surfSpot.id],
  )

  useEffect(() => {
    if (userId && isOpen) {
      setIsLoadingTrips(true)
      fetchTrips(userId).finally(() => setIsLoadingTrips(false))
    }
  }, [userId, isOpen, fetchTrips])

  const getTripSpotId = useCallback(
    (trip: Trip): string | null => {
      const spot = trip.spots?.find((s) => s.surfSpotId === Number(surfSpot.id))
      return spot?.id || null
    },
    [surfSpot.id],
  )

  const handleSelectTrip = async (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId)
    if (!trip) return

    const alreadyInTrip = isSpotInTrip(trip)
    const spotSurfSpotId = Number(surfSpot.id)

    // If already in trip, remove it
    if (alreadyInTrip) {
      const tripSpotId = getTripSpotId(trip)
      if (!tripSpotId) {
        onError('Error', 'Could not find spot in trip.')
        return
      }

      setRemovingFromTripId(tripId)

      // Optimistically remove from UI
      setTrips((prevTrips: Trip[]) =>
        prevTrips.map((t: Trip) =>
          t.id === tripId
            ? {
                ...t,
                spots: t.spots?.filter((s) => s.id !== tripSpotId) || [],
              }
            : t,
        ),
      )

      const formData = new FormData()
      formData.append('intent', 'remove-spot')
      formData.append('tripId', tripId)
      formData.append('tripSpotId', tripSpotId)
      fetcher.submit(formData, { method: 'POST', action: '/trips' })
      
      // Reset state after a delay to allow action to complete
      setTimeout(() => {
        setRemovingFromTripId(null)
      }, 500)
      return
    }

    // Otherwise, add it
    setAddingToTripId(tripId)

    // Optimistically update the trip in context
    // Note: We use surfSpotId for rollback since IDs must come from backend
    const spotToAdd: TripSpot = {
      id: '', // Will be set by backend - using surfSpotId for identification
      surfSpotId: spotSurfSpotId,
      surfSpotName: surfSpot.name,
      surfSpotRating: surfSpot.rating,
      addedAt: new Date().toISOString(),
    }

    setTrips((prevTrips: Trip[]) =>
      prevTrips.map((t: Trip) =>
        t.id === tripId
          ? {
              ...t,
              spots: [...(t.spots || []), spotToAdd],
            }
          : t,
      ),
    )

    const formData = new FormData()
    formData.append('intent', 'add-spot')
    formData.append('tripId', tripId)
    formData.append('surfSpotId', spotSurfSpotId.toString())
    fetcher.submit(formData, { method: 'POST', action: '/trips' })

    // Reset state after a delay to allow action to complete
    setTimeout(() => {
      setAddingToTripId(null)
    }, 500)
  }

  const handleCreateTrip = () => {
    onClose()
    navigate('/add-trip')
  }

  if (!isOpen) return null

  return (
    <Modal onClose={onClose}>
      <div className="trip-selection-modal">
        <h2>Add to Trip</h2>
        {isLoadingTrips ? (
          <div className="trip-selection-loading">
            <Loading />
          </div>
        ) : trips.length === 0 ? (
          <div>
            <p>You don't have any trips yet.</p>
            <p className="text-secondary">
              Create a trip first to add surf spots.
            </p>
            <div className="trip-selection-actions">
              <Button
                label="Create Trip"
                variant="primary"
                onClick={handleCreateTrip}
              />
              <Button label="Cancel" variant="cancel" onClick={onClose} />
            </div>
          </div>
        ) : (
          <div>
            <p>Select a trip to add this surf spot to:</p>
            <div className="trip-selection-list">
              {trips.map((trip) => (
                <TripSelectionItem
                  key={trip.id}
                  trip={trip}
                  isSpotInTrip={(trip) => isSpotInTrip(trip) ?? false}
                  isAdding={addingToTripId === trip.id}
                  isRemoving={removingFromTripId === trip.id}
                  onSelect={handleSelectTrip}
                />
              ))}
            </div>
            <div className="trip-selection-actions">
              <Button label="Cancel" variant="cancel" onClick={onClose} />
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
