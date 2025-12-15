import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useFetcher } from 'react-router'
import { Modal, Button, Loading } from '~/components'
import { useTripContext, useLayoutContext } from '~/contexts'
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
  const { closeDrawer } = useLayoutContext()
  const { trips: tripsFromContext, setTrips } = useTripContext()
  const tripsFetcher = useFetcher<{ trips: Trip[]; error?: string }>()
  
  // Use trips from props (loaded via loader) if available, otherwise use fetcher data, otherwise fall back to context
  const trips = tripsFromProps || tripsFetcher.data?.trips || tripsFromContext
  
  // Determine if we have trips available from any source
  const hasTrips = (tripsFromProps && tripsFromProps.length > 0) || 
                   (tripsFromContext.length > 0) || 
                   (tripsFetcher.data?.trips && tripsFetcher.data.trips.length > 0)
  
  // Loading state: only true when actively fetching AND we don't have trips yet
  const isLoadingTrips = tripsFetcher.state === 'loading' && !hasTrips
  const [addingToTripId, setAddingToTripId] = useState<string | null>(null)
  const [removingFromTripId, setRemovingFromTripId] = useState<string | null>(
    null,
  )

  const isSpotInTrip = useCallback(
    (trip: Trip) =>
      trip.spots?.some((s) => s.surfSpotId === Number(surfSpot.id)) ?? false,
    [surfSpot.id],
  )

  // Load trips via resource route when modal opens (if not provided as props and we don't have trips)
  useEffect(() => {
    if (isOpen && userId && !tripsFromProps && !hasTrips && tripsFetcher.state === 'idle' && !tripsFetcher.data) {
      tripsFetcher.load('/resources/trips')
    }
  }, [isOpen, userId, tripsFromProps, hasTrips, tripsFetcher.state, tripsFetcher.data])

  // Update context with fetched trips when they arrive
  useEffect(() => {
    if (tripsFetcher.state === 'idle' && tripsFetcher.data) {
      // Update context with fetched trips
      if (tripsFetcher.data.trips && Array.isArray(tripsFetcher.data.trips)) {
        setTrips(tripsFetcher.data.trips)
      }
      // Show error if present
      if (tripsFetcher.data.error) {
        onError('Error', tripsFetcher.data.error)
      }
    }
  }, [tripsFetcher.state, tripsFetcher.data, setTrips, onError])

  // Initialize trips from props into context when modal opens
  useEffect(() => {
    if (isOpen && tripsFromProps) {
      setTrips(tripsFromProps)
    }
  }, [isOpen, tripsFromProps, setTrips])

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
    closeDrawer() // Close the drawer if we're navigating away
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
