import { useState, memo, useCallback } from 'react'

import { SurfSpot } from '~/types/surfSpots'
import { User } from '~/types/user'
import DropdownMenu from '../DropdownMenu'
import TripSelectionModal from '../TripSelectionModal'

import { useSurfSpotsContext, useSignUpPromptContext } from '~/contexts'
import { FetcherSubmitParams } from '~/types/api'
import { InfoModal, InfoModalState } from '../Modal'

interface IProps {
  surfSpot: SurfSpot
  navigate: (path: string) => void
  user: User | null
  onFetcherSubmit?: (params: FetcherSubmitParams) => void
}

export const SurfSpotActions = memo((props: IProps) => {
  const { surfSpot, navigate, user, onFetcherSubmit } = props
  const [surfSpotState, setSurfSpotState] = useState<SurfSpot>(surfSpot)
  const [tripSelectionModalOpen, setTripSelectionModalOpen] = useState(false)
  const [infoModal, setInfoModal] = useState<InfoModalState>({
    isOpen: false,
    message: '',
  })

  const { updateSurfSpot } = useSurfSpotsContext()
  const { showSignUpPrompt } = useSignUpPromptContext()

  const { id: surfSpotId, isSurfedSpot, isWatched, createdBy } = surfSpotState

  const canEdit = user && createdBy === user.id

  const closeTripModal = useCallback(() => setTripSelectionModalOpen(false), [])
  const closeInfoModal = useCallback(
    () => setInfoModal({ isOpen: false, message: '' }),
    [],
  )

  const showInfoModal = useCallback((title: string, message: string) => {
    setInfoModal({ isOpen: true, title, message })
  }, [])

  const handleAction = async (
    actionType: 'add' | 'remove',
    target: 'user-spots' | 'watch',
  ) => {
    try {
      if (!user) {
        showSignUpPrompt(target === 'watch' ? 'watch-list' : 'surfed-spots')
        return
      }

      // Determine which property to toggle based on target
      const propertyMap = {
        'user-spots': 'isSurfedSpot' as const,
        watch: 'isWatched' as const,
      }

      const property = propertyMap[target]
      const currentValue = surfSpotState[property]
      const newValue = !currentValue

      // Update local state optimistically
      const updatedSurfSpot = {
        ...surfSpotState,
        [property]: newValue,
      }

      setSurfSpotState(updatedSurfSpot)

      // Update context immediately - no need to wait for API
      try {
        updateSurfSpot(surfSpotId, { [property]: newValue })
      } catch (contextError) {
        console.error('Error updating surf spot in context:', contextError)
        // Revert optimistic update on context error
        setSurfSpotState(surfSpot)
      }

      // Submit to server using existing action
      if (onFetcherSubmit) {
        try {
          const formData = new FormData()
          formData.append('actionType', actionType)
          formData.append('target', target)
          formData.append('surfSpotId', surfSpotId)
          onFetcherSubmit(formData)
        } catch (submitError) {
          console.error('Error submitting fetcher:', submitError)
          // Revert optimistic update on submit error
          setSurfSpotState(surfSpot)
          throw submitError
        }
      }
    } catch (error) {
      console.error('Error in handleAction:', error)
      // Error will be handled by fetcher error handling in parent components
      // Revert optimistic update
      setSurfSpotState(surfSpot)
    }
  }

  const handleAddToTrip = () => {
    if (!user) {
      showSignUpPrompt('trips')
      return
    }
    setTripSelectionModalOpen(true)
  }

  const menuItems = [
    {
      label: isWatched ? 'Remove from watch list' : 'Add to watch list',
      iconKey: isWatched ? 'bin' : 'heart',
      onClick: () => handleAction(isWatched ? 'remove' : 'add', 'watch'),
      closeOnClick: false,
    },
    {
      label: isSurfedSpot ? 'Remove from surfed spots' : 'Add to surfed spots',
      iconKey: isSurfedSpot ? 'bin' : 'plus',
      onClick: () =>
        handleAction(isSurfedSpot ? 'remove' : 'add', 'user-spots'),
      closeOnClick: false,
    },
    {
      label: 'Add to trip',
      iconKey: 'plane',
      onClick: handleAddToTrip,
    },
    ...(canEdit
      ? [
          {
            label: 'Edit surf spot',
            iconKey: 'edit',
            onClick: () => navigate(`/edit-surf-spot/${surfSpot.id}`),
          },
        ]
      : []),
  ]

  return (
    <div className="actions">
      <DropdownMenu items={menuItems} align="right" />
      {user?.id && (
          <TripSelectionModal
            isOpen={tripSelectionModalOpen}
            onClose={closeTripModal}
            onError={showInfoModal}
            surfSpot={surfSpotState}
            userId={user.id}
            onFetcherSubmit={onFetcherSubmit}
          />
      )}
      <InfoModal
        isOpen={infoModal.isOpen}
        onClose={closeInfoModal}
        title={infoModal.title}
        message={infoModal.message}
      />
    </div>
  )
})

SurfSpotActions.displayName = 'SurfSpotActions'
