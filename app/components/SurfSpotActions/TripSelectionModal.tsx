import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useFetcher } from 'react-router'
import { Modal, Button, Loading } from '~/components'
import { useTripContext } from '~/contexts'
import { Trip, TripSpot } from '~/types/trip'
import { SurfSpot } from '~/types/surfSpots'
import { TripSelectionItem } from './TripSelectionItem'
import { FetcherSubmitParams } from './index'

interface TripSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onError: (title: string, message: string) => void
  surfSpot: SurfSpot
  userId: string
  onFetcherSubmit?: (params: FetcherSubmitParams) => void
  trips?: Trip[]
}

export const TripSelectionModal = ({
  isOpen,
  onClose,
  onError,
  surfSpot,
  userId,
  onFetcherSubmit,
  trips: tripsFromProps,
}: TripSelectionModalProps) => {
  const navigate = useNavigate()
  const { trips: tripsFromContext, setTrips } = useTripContext()
  const tripsFetcher = useFetcher<Trip[]>()
  
  // Use trips from props (loaded via loader) if available, otherwise use fetcher data, otherwise fall back to context
  const trips = tripsFromProps || (tripsFetcher.data as Trip[]) || tripsFromContext
  const [isLoadingTrips, setIsLoadingTrips] = useState(false)
  const [addingToTripId, setAddingToTripId] = useState<string | null>(null)
  const [removingFromTripId, setRemovingFromTripId] = useState<string | null>(
    null,
  )

  const isSpotInTrip = useCallback(
    (trip: Trip) =>
      trip.spots?.some((s) => s.surfSpotId === Number(surfSpot.id)) ?? false,
    [surfSpot.id],
  )

  // Load trips via resource route when modal opens (if not provided as props)
  useEffect(() => {
    if (isOpen && userId && !tripsFromProps) {
      setIsLoadingTrips(true)
      tripsFetcher.load('/resources/trips')
    }
  }, [isOpen, userId, tripsFromProps, tripsFetcher])

  // Update loading state based on fetcher
  useEffect(() => {
    if (tripsFetcher.state === 'idle' && tripsFetcher.data) {
      setIsLoadingTrips(false)
      // Update context with fetched trips
      if (Array.isArray(tripsFetcher.data)) {
        setTrips(tripsFetcher.data)
      }
    } else if (tripsFetcher.state === 'loading') {
      setIsLoadingTrips(true)
    }
  }, [tripsFetcher.state, tripsFetcher.data, setTrips])

  // Initialize trips from props into context when modal opens
  useEffect(() => {
    if (tripsFromProps && isOpen) {
      setTrips(tripsFromProps)
    }
  }, [tripsFromProps, isOpen, setTrips])

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
    const intent = alreadyInTrip ? 'remove-spot' : 'add-spot'

    // Get tripSpotId BEFORE optimistic update (from current state)
    let tripSpotId: string | null = null
    if (alreadyInTrip) {
      tripSpotId = getTripSpotId(trip)
      
      // If we can't find the ID, show error - trips should be loaded from server
      if (!tripSpotId) {
        onError(
          'Error',
          'Could not find spot in trip. Please try refreshing the page.',
        )
        return
      }
    }

    // Set loading state
    if (alreadyInTrip) {
      setRemovingFromTripId(tripId)
    } else {
      setAddingToTripId(tripId)
    }

    // Optimistically update UI
    setTrips((prevTrips: Trip[]) =>
      prevTrips.map((t: Trip) => {
        if (t.id !== tripId) return t

        if (alreadyInTrip) {
          // Remove spot by matching surfSpotId (more reliable than ID)
          return {
            ...t,
            spots: t.spots?.filter((s) => s.surfSpotId !== spotSurfSpotId) || [],
          }
        } else {
          // Add spot optimistically
          const spotToAdd: TripSpot = {
            id: '', // Will be set by backend
            surfSpotId: spotSurfSpotId,
            surfSpotName: surfSpot.name,
            surfSpotRating: surfSpot.rating,
            addedAt: new Date().toISOString(),
          }
          return {
            ...t,
            spots: [...(t.spots || []), spotToAdd],
          }
        }
      }),
    )

    // Submit using the same fetcher pattern as other actions
    if (onFetcherSubmit) {
      const formData = new FormData()
      formData.append('intent', intent)
      formData.append('tripId', tripId)
      formData.append('surfSpotId', spotSurfSpotId.toString())
      if (alreadyInTrip && tripSpotId) {
        formData.append('tripSpotId', tripSpotId)
      }
      onFetcherSubmit(formData)
    }

    // Reset loading state after a delay
    setTimeout(() => {
      setAddingToTripId(null)
      setRemovingFromTripId(null)
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
