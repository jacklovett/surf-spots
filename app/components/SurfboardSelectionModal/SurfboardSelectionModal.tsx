import { useState, useEffect, useCallback } from 'react'
import { useFetcher } from 'react-router'
import { SelectionModal } from '~/components'
import { useToastContext } from '~/contexts'
import { Trip } from '~/types/trip'
import { Surfboard } from '~/types/surfboard'
import { SelectionItem } from '../SelectionModal'

interface SurfboardSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  trip: Trip
  userId: string
  onSubmitAction: (intent: string, data: Record<string, string>) => void
  onTripUpdate: (updater: (prev: Trip) => Trip) => void
  actionState?: 'idle' | 'submitting' | 'loading'
  actionData?: { success?: boolean; error?: string }
}

export const SurfboardSelectionModal = ({
  isOpen,
  onClose,
  trip,
  userId,
  onSubmitAction,
  onTripUpdate,
  actionState = 'idle',
  actionData,
}: SurfboardSelectionModalProps) => {
  const { showError: showToastError } = useToastContext()
  const surfboardsFetcher = useFetcher<{ surfboards: Surfboard[]; error?: string }>()
  
  const [allSurfboards, setAllSurfboards] = useState<Surfboard[]>([])
  const [isLoadingSurfboards, setIsLoadingSurfboards] = useState(true)
  const [addingSurfboardId, setAddingSurfboardId] = useState<string | null>(null)
  const [removingSurfboardId, setRemovingSurfboardId] = useState<string | null>(null)

  const isSurfboardInTrip = useCallback(
    (surfboardId: string): boolean => (trip.surfboards?.some((sb) => sb.surfboardId === surfboardId) ?? false),
    [trip.surfboards],
  )

  const getTripSurfboardId = useCallback(
    (surfboardId: string): string | null => {
      const tripSurfboard = trip.surfboards?.find(
        (sb) => sb.surfboardId === surfboardId,
      )
      return tripSurfboard?.id || null
    },
    [trip.surfboards],
  )

  // Load surfboards when modal opens
  useEffect(() => {
    if (isOpen && userId && surfboardsFetcher.state === 'idle' && !surfboardsFetcher.data) {
      // Trigger the fetch for surfboards
      surfboardsFetcher.load('/resources/surfboards')
    }
    // Reset loading state when modal closes
    if (!isOpen) {
      setIsLoadingSurfboards(true)
      setAllSurfboards([])
    }
  }, [isOpen, userId, surfboardsFetcher])

  // Update surfboards state when fetcher data arrives
  useEffect(() => {
    if (surfboardsFetcher.state === 'idle' && surfboardsFetcher.data) {
        const surfboards = surfboardsFetcher.data.surfboards
        setIsLoadingSurfboards(false)
        if (Array.isArray(surfboards)) {
            setAllSurfboards(surfboards)
        }
        if (surfboardsFetcher.data.error) {
            showToastError(surfboardsFetcher.data.error)
        onClose()
      }
    } else if (surfboardsFetcher.state === 'loading' && !surfboardsFetcher.data) {
      setIsLoadingSurfboards(true)
    }
  }, [surfboardsFetcher, showToastError, onClose])

  // Clear loading states when action completes
  // Keep spinner visible while submitting or loading, only clear when idle with data
  useEffect(() => {
    if (actionState === 'idle' && actionData !== undefined) {
      // Action completed (success or error) - clear loading states
      setAddingSurfboardId(null)
      setRemovingSurfboardId(null)
    }
    // Keep loading states active while submitting or loading
  }, [actionState, actionData])

  const handleAddSurfboard = (surfboardId: string) => {
    if (!userId) return

    setAddingSurfboardId(surfboardId)

    // Let the server response update the UI via React Router revalidation
    onSubmitAction('add-surfboard', { surfboardId })
  }

  const handleRemoveSurfboard = (surfboardId: string) => {
    if (!userId) return

    const tripSurfboardId = getTripSurfboardId(surfboardId)
    if (!tripSurfboardId) {
      showToastError('Could not find surfboard in trip.')
      return
    }

    setRemovingSurfboardId(surfboardId)

    // Optimistic update - we have a real ID so this is safe
    onTripUpdate((prev) => ({
      ...prev,
      surfboards: prev.surfboards?.filter(
        (sb) => sb.id !== tripSurfboardId,
      ) || [],
        }))

    onSubmitAction('remove-surfboard', { tripSurfboardId })
  }

  // Convert surfboards to SelectionItem format
  const selectionItems: SelectionItem[] = allSurfboards.map((sb) => ({
    id: sb.id,
    name: sb.name,
    subtitle: sb.boardType,
    description: sb.description || undefined,
  }))

  return (
    <SelectionModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Surfboard"
      description="Select a surfboard to add or remove from this trip:"
      items={selectionItems}
      isLoading={isLoadingSurfboards}
      onLoadItems={() => {
        if (userId && surfboardsFetcher.state === 'idle' && !surfboardsFetcher.data) {
          surfboardsFetcher.load('/resources/surfboards')
        }
      }}
      isItemSelected={(item) => (removingSurfboardId === item.id ? false : isSurfboardInTrip(item.id))      }
      onAdd={(item) => handleAddSurfboard(item.id)}
      onRemove={(item) => handleRemoveSurfboard(item.id)}
      addingItemId={addingSurfboardId}
      removingItemId={removingSurfboardId}
      emptyStateTitle="No available surfboards to add."
      emptyStateDescription="Create a surfboard first to add it to this trip."
      error={surfboardsFetcher.data?.error}
      onError={(error) => {
        showToastError(error)
        onClose()
      }}
    />
  )
}
