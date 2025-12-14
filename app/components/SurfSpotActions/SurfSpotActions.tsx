import { useState, memo, useCallback } from 'react'

import { SurfSpot } from '~/types/surfSpots'
import { User } from '~/types/user'
import { Trip } from '~/types/trip'
import DropdownMenu from '../DropdownMenu'
import { useSurfSpotsContext } from '~/contexts'
import { useSignUpPrompt } from '~/hooks'
import { FetcherSubmitParams } from './index'
import { TripSelectionModal } from './TripSelectionModal'
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
  const { showSignUpPrompt, SignUpPromptModal } = useSignUpPrompt()

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
    updateSurfSpot(surfSpotId, { [property]: newValue })

    // Submit to server using existing action
    if (onFetcherSubmit) {
      const formData = new FormData()
      formData.append('actionType', actionType)
      formData.append('target', target)
      formData.append('surfSpotId', surfSpotId)
      onFetcherSubmit(formData)
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
      <SignUpPromptModal />
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
