import {
  useState,
  memo,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { FetcherWithComponents } from 'react-router'

import { SurfSpot } from '~/types/surfSpots'
import { User } from '~/types/user'
import { ActionData } from '~/types/api'
import DropdownMenu from '../DropdownMenu'
import TripSelectionModal from '../TripSelectionModal'

import {
  useSurfSpotsContext,
  useSignUpPromptContext,
  useLayoutContext,
  useToastContext,
} from '~/contexts'
import { FetcherSubmitParams } from '~/types/api'
import { InfoModal, InfoModalState } from '../Modal'
import { ERROR_OPEN_SESSION_LOG } from '~/utils/errorUtils'

interface IProps {
  surfSpot: SurfSpot
  navigate: (path: string) => void
  user: User | null
  onFetcherSubmit?: (params: FetcherSubmitParams) => void
  surfActionFetcher?: FetcherWithComponents<ActionData>
}

export const SurfSpotActions = memo((props: IProps) => {
    const {
      surfSpot,
      navigate,
      user,
      onFetcherSubmit,
      surfActionFetcher,
    } = props

    const [surfSpotState, setSurfSpotState] = useState<SurfSpot>(surfSpot)
    const [tripSelectionModalOpen, setTripSelectionModalOpen] = useState(false)
    const [infoModal, setInfoModal] = useState<InfoModalState>({
      isOpen: false,
      message: '',
    })

    const { updateSurfSpot } = useSurfSpotsContext()
    const { showSignUpPrompt } = useSignUpPromptContext()
    const { closeDrawer } = useLayoutContext()
    const { showSuccess, showError } = useToastContext()

    const lastSurfActionDataRef = useRef(surfActionFetcher?.data)

    const { id: surfSpotId, isSurfedSpot, isWatched, createdBy } = surfSpotState

    const canEdit = user && createdBy === user.id

    useEffect(() => {
      setSurfSpotState(surfSpot)
    }, [surfSpot])

    useEffect(() => {
      if (!surfActionFetcher) return
      if (
        surfActionFetcher.state === 'idle' &&
        surfActionFetcher.data &&
        surfActionFetcher.data !== lastSurfActionDataRef.current
      ) {
        lastSurfActionDataRef.current = surfActionFetcher.data
      }
      if (surfActionFetcher.state === 'submitting') {
        lastSurfActionDataRef.current = undefined
      }
    }, [surfActionFetcher])

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

        if (actionType === 'remove') {
          const msg =
            target === 'user-spots'
              ? 'Removed from your surfed spots.'
              : 'Removed from your watch list.'
          showSuccess(msg)
        }

        const propertyMap = {
          'user-spots': 'isSurfedSpot' as const,
          watch: 'isWatched' as const,
        }

        const property = propertyMap[target]
        const currentValue = surfSpotState[property]
        const newValue = !currentValue

        const updatedSurfSpot = {
          ...surfSpotState,
          [property]: newValue,
        }

        setSurfSpotState(updatedSurfSpot)

        try {
          updateSurfSpot(surfSpotId, { [property]: newValue })
        } catch (contextError) {
          console.error('Error updating surf spot in context:', contextError)
          setSurfSpotState(surfSpot)
        }

        if (onFetcherSubmit) {
          try {
            if (actionType === 'add' && target === 'user-spots') {
              const spotLabel = surfSpot.name?.trim() || 'Surf spot'
              showSuccess(`Added to your surfed spots. ${spotLabel} is on your list.`)
            }
            const formData = new FormData()
            formData.append('actionType', actionType)
            formData.append('target', target)
            formData.append('surfSpotId', surfSpotId)
            onFetcherSubmit(formData)
          } catch (submitError) {
            console.error('Error submitting fetcher:', submitError)
            setSurfSpotState(surfSpot)
            throw submitError
          }
        }
      } catch (error) {
        console.error('Error in handleAction:', error)
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

    const handleOpenAddSession = () => {
      if (!user) {
        showSignUpPrompt('surfed-spots')
        return
      }
      const base = surfSpotState.path?.replace(/\/+$/, '') ?? ''
      if (base) {
        navigate(`${base}/session`)
        closeDrawer()
      } else {
        showError(ERROR_OPEN_SESSION_LOG)
      }
    }

    const menuItems = [
      {
        label: isWatched ? 'Remove from watch list' : 'Add to watch list',
        iconKey: isWatched ? 'bin' : 'heart',
        onClick: () => handleAction(isWatched ? 'remove' : 'add', 'watch'),
        closeOnClick: !isWatched,
      },
      {
        label: isSurfedSpot ? 'Remove from surfed spots' : 'Add to surfed spots',
        iconKey: isSurfedSpot ? 'bin' : 'plus',
        onClick: () =>
          handleAction(isSurfedSpot ? 'remove' : 'add', 'user-spots'),
        closeOnClick: !isSurfedSpot,
      },
      {
        label: 'Add session',
        iconKey: 'stopwatch',
        onClick: handleOpenAddSession,
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
              onClick: () => {
                closeDrawer()
                navigate(`/edit-surf-spot/${surfSpot.id}`)
              },
            },
          ]
        : []),
    ]

    return (
      <>
        <div className="actions">
          <DropdownMenu items={menuItems} align="right" />
          {user?.id && (
            <TripSelectionModal
              isOpen={tripSelectionModalOpen}
              onClose={closeTripModal}
              onError={showInfoModal}
              surfSpot={surfSpotState}
              userId={user.id}
            />
          )}
          <InfoModal
            isOpen={infoModal.isOpen}
            onClose={closeInfoModal}
            title={infoModal.title}
            message={infoModal.message}
          />
        </div>
      </>
    )
})

SurfSpotActions.displayName = 'SurfSpotActions'
