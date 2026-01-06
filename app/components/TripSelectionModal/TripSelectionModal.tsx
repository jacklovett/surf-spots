import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useFetcher, useLocation } from 'react-router'
import { SelectionModal } from '~/components'
import { useTripContext, useLayoutContext } from '~/contexts'
import { Trip } from '~/types/trip'
import { SurfSpot } from '~/types/surfSpots'
import { formatDate } from '~/utils/dateUtils'
import { SelectionItem } from '../SelectionModal'
import { FetcherSubmitParams } from '~/types/api'

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
  const location = useLocation()
  const { closeDrawer } = useLayoutContext()
  const { trips: tripsFromContext, setTrips } = useTripContext()
  const tripsFetcher = useFetcher<{ trips: Trip[]; error?: string }>()
  const actionFetcher = useFetcher<{ success?: boolean; error?: string }>()
  
  // Use trips from props (loaded via loader) if available, otherwise use fetcher data, otherwise fall back to context
  const trips = tripsFromProps || tripsFetcher.data?.trips || tripsFromContext
  
  // Determine if we have trips data available from any source (even if empty)
  const hasTripsData = tripsFromProps !== undefined || 
                       tripsFetcher.data?.trips !== undefined || 
                       Array.isArray(tripsFromContext)

  const [isLoadingTrips, setIsLoadingTrips] = useState(true)
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
    if (isOpen) {
      // If we have trips from props, we're done loading
      if (!!tripsFromProps) {
        setIsLoadingTrips(false)
        return
      }
      // If we have trips data from fetcher, we're done loading
      if (!!tripsFetcher.data?.trips) {
        setIsLoadingTrips(false)
        return
      }
      // If we have trips in context (even if empty array), we're done loading
      if (Array.isArray(tripsFromContext)) {
        setIsLoadingTrips(false)
        // Only load if context is empty and we haven't loaded yet
        if (tripsFromContext.length === 0 && userId && tripsFetcher.state === 'idle' && !tripsFetcher.data) {
          tripsFetcher.load('/resources/trips')
        }
      }
    }
    // Reset loading state when modal closes
    if (!isOpen) {
      setIsLoadingTrips(true)
    }
  }, [isOpen, userId, tripsFromProps, tripsFromContext, tripsFetcher])

  // Update context with fetched trips when they arrive
  useEffect(() => {
    if (tripsFetcher.state === 'idle' && tripsFetcher.data) {
      setIsLoadingTrips(false)
      // Update context with fetched trips
      const trips = tripsFetcher.data.trips
      if (Array.isArray(trips)) {
        setTrips(trips)
      }
      if (tripsFetcher.data.error) {
        onError('Error', tripsFetcher.data.error)
      }
    } else if (tripsFetcher.state === 'loading' && !tripsFetcher.data) {
      setIsLoadingTrips(true)
    }
  }, [tripsFetcher.state, tripsFetcher.data, setTrips, onError])

  // Initialize trips from props into context when modal opens
  useEffect(() => {
    if (isOpen && tripsFromProps) {
      setTrips(tripsFromProps)
    }
  }, [isOpen, tripsFromProps, setTrips])

  // Clear loading states when action completes
  useEffect(() => {
    if (actionFetcher.state === 'idle' && actionFetcher.data !== undefined) {
      // Action completed (success or error) - clear loading states
      setAddingToTripId(null)
      setRemovingFromTripId(null)
      
      if (actionFetcher.data.error) {
        onError('Error', actionFetcher.data.error)
      }
    }
  }, [actionFetcher.state, actionFetcher.data, onError])

  const getTripSpotId = useCallback(
    (trip: Trip): string | null => {
      const spot = trip.spots?.find((s) => s.surfSpotId === Number(surfSpot.id))
      return spot?.id || null
    },
    [surfSpot.id],
  )

  const handleAddSpot = (tripId: string) => {
    if (!userId) return

    const spotSurfSpotId = Number(surfSpot.id)
    setAddingToTripId(tripId)

    // Submit action using internal fetcher to track completion
    const formData = new FormData()
    formData.append('intent', 'add-spot')
    formData.append('tripId', tripId)
    formData.append('surfSpotId', spotSurfSpotId.toString())
    
    // Use current route if it's a surf spot route, otherwise fallback to /surf-spots
    const route = location.pathname.includes('/surf-spot/') 
      ? location.pathname 
      : '/surf-spots'
    actionFetcher.submit(formData, { method: 'POST', action: route })
  }

  const handleRemoveSpot = (tripId: string) => {
    if (!userId) return

    const trip = trips.find((t) => t.id === tripId)
    if (!trip) return

    const tripSpotId = getTripSpotId(trip)
    if (!tripSpotId) {
      onError(
        'Error',
        'Could not find spot in trip. Please try refreshing the page.',
      )
      return
    }

    setRemovingFromTripId(tripId)

    // Optimistic update - we have a real ID so this is safe
    setTrips((prevTrips: Trip[]) =>
      prevTrips.map((t: Trip) => {
        if (t.id !== tripId) return t
        return {
          ...t,
          spots: t.spots?.filter((s) => s.id !== tripSpotId) || [],
        }
      }),
    )

    // Submit action using internal fetcher to track completion
    const formData = new FormData()
    formData.append('intent', 'remove-spot')
    formData.append('tripId', tripId)
    formData.append('tripSpotId', tripSpotId)
    
    // Use current route if it's a surf spot route, otherwise fallback to /surf-spots
    const route = location.pathname.includes('/surf-spot/') 
      ? location.pathname 
      : '/surf-spots'
    actionFetcher.submit(formData, { method: 'POST', action: route })
  }

  const handleCreateTrip = () => {
    onClose()
    navigate('/add-trip')
    closeDrawer()
  }

  const handleGoToTrips = () => {
    onClose()
    navigate('/trips')
    closeDrawer()
  }

  // Convert trips to SelectionItem format
  const selectionItems: SelectionItem[] = trips.map((trip) => ({
    id: trip.id,
    name: trip.title,
    metadata: trip.startDate && trip.endDate 
      ? `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}` 
      : undefined,
    trip, // Include full trip object for handlers
  }))

  return (
    <SelectionModal
      isOpen={isOpen}
      onClose={onClose}
      header={{
        title: "Add to Trip",
        description: "Select a trip to add this surf spot to:"
      }}
      items={selectionItems}
      isLoading={isLoadingTrips}
      onLoadItems={() => {
        if (userId && !tripsFromProps && !hasTripsData && tripsFetcher.state === 'idle' && !tripsFetcher.data) {
          tripsFetcher.load('/resources/trips')
        }
      }}
      selectionActions={{
        isItemSelected: (item) => {
          const trip = item.trip as Trip
          return isSpotInTrip(trip)
        },
        onAdd: (item) => {
          const trip = item.trip as Trip
          handleAddSpot(trip.id)
        },
        onRemove: (item) => {
          const trip = item.trip as Trip
          handleRemoveSpot(trip.id)
        },
        addingItemId: addingToTripId,
        removingItemId: removingFromTripId,
      }}
      emptyState={{
        title: "No trips yet",
        description: "Create a trip to start planning your surf adventures and add spots like this one.",
        ctaText: "Create Trip",
        ctaAction: handleCreateTrip,
      }}
      footer={{
        buttonText: "Go to Trips",
        buttonAction: handleGoToTrips,
      }}
      error={{
        error: tripsFetcher.data?.error,
        onError: (error) => onError('Error', error)
      }}
    />
  )
}