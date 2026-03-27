import {
  useState,
  memo,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { useFetcher, useLocation, FetcherWithComponents } from 'react-router'

import { SurfSpot } from '~/types/surfSpots'
import { User } from '~/types/user'
import { Surfboard } from '~/types/surfboard'
import { ActionData } from '~/types/api'
import DropdownMenu from '../DropdownMenu'
import TripSelectionModal from '../TripSelectionModal'
import SurfSessionFeedbackModal from '../SurfSessionFeedbackModal'

import {
  useSurfSpotsContext,
  useSignUpPromptContext,
  useLayoutContext,
  useToastContext,
} from '~/contexts'
import { FetcherSubmitParams } from '~/types/api'
import { InfoModal, InfoModalState } from '../Modal'
import {
  ERROR_SAVE_SESSION_FEEDBACK,
  getSafeFetcherErrorMessage,
} from '~/utils/errorUtils'
import { resolveSurfSpotActionUrl } from '~/utils/surfSpotUtils'

interface IProps {
  surfSpot: SurfSpot
  navigate: (path: string) => void
  user: User | null
  onFetcherSubmit?: (params: FetcherSubmitParams) => void
  /** User quiver for optional board field in session log */
  surfboards?: Surfboard[]
  surfActionFetcher?: FetcherWithComponents<ActionData>
}

const SurfSpotActionsInner = (props: IProps) => {
    const {
      surfSpot,
      navigate,
      user,
      onFetcherSubmit,
      surfboards = [],
      surfActionFetcher,
    } = props

    const [surfSpotState, setSurfSpotState] = useState<SurfSpot>(surfSpot)
    const [tripSelectionModalOpen, setTripSelectionModalOpen] = useState(false)
    const [sessionFeedbackOpen, setSessionFeedbackOpen] = useState(false)
    const [infoModal, setInfoModal] = useState<InfoModalState>({
      isOpen: false,
      message: '',
    })

    const location = useLocation()
    const sessionFeedbackFetcher = useFetcher<ActionData>()
    const { updateSurfSpot } = useSurfSpotsContext()
    const { showSignUpPrompt } = useSignUpPromptContext()
    const { closeDrawer } = useLayoutContext()
    const { showSuccess, showError } = useToastContext()

    const pendingOptimisticSurfedRef = useRef(false)
    const lastSurfActionDataRef = useRef(surfActionFetcher?.data)
    const lastSessionFeedbackDataRef = useRef(sessionFeedbackFetcher.data)

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
        const responseData = surfActionFetcher.data as ActionData
        const hadError = !!(
          responseData.error ||
          (responseData.hasError && responseData.submitStatus)
        )
        if (pendingOptimisticSurfedRef.current) {
          if (hadError) {
            setSessionFeedbackOpen(false)
          }
          pendingOptimisticSurfedRef.current = false
        }
      }
      if (surfActionFetcher.state === 'submitting') {
        lastSurfActionDataRef.current = undefined
      }
    }, [surfActionFetcher])

    useEffect(() => {
      if (
        sessionFeedbackFetcher.state === 'idle' &&
        sessionFeedbackFetcher.data &&
        sessionFeedbackFetcher.data !== lastSessionFeedbackDataRef.current
      ) {
        lastSessionFeedbackDataRef.current = sessionFeedbackFetcher.data
        const responseData = sessionFeedbackFetcher.data
        if (responseData.error || (responseData.hasError && responseData.submitStatus)) {
          showError(getSafeFetcherErrorMessage(responseData, ERROR_SAVE_SESSION_FEEDBACK))
        }
      }
      if (sessionFeedbackFetcher.state === 'submitting') {
        lastSessionFeedbackDataRef.current = undefined
      }
    }, [sessionFeedbackFetcher.data, sessionFeedbackFetcher.state, showError])

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
              pendingOptimisticSurfedRef.current = true
              const spotLabel = surfSpot.name?.trim() || 'Surf spot'
              showSuccess(`Added to your surfed spots. ${spotLabel} is on your list.`)
              setSessionFeedbackOpen(true)
            }
            const formData = new FormData()
            formData.append('actionType', actionType)
            formData.append('target', target)
            formData.append('surfSpotId', surfSpotId)
            formData.append('surfSpotName', surfSpot.name ?? '')
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

    const handleOpenSessionLog = () => {
      if (!user) {
        showSignUpPrompt('surfed-spots')
        return
      }
      setSessionFeedbackOpen(true)
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
        label: 'Log your surf',
        iconKey: 'surfboard',
        onClick: handleOpenSessionLog,
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
        <SurfSessionFeedbackModal
          isOpen={sessionFeedbackOpen}
          onClose={() => setSessionFeedbackOpen(false)}
          surfSpotId={surfSpotState.id}
          surfSpotName={surfSpotState.name ?? ''}
          actionPath={resolveSurfSpotActionUrl(location.pathname)}
          fetcher={sessionFeedbackFetcher}
          surfboards={surfboards}
        />
      </>
    )
}

export const SurfSpotActions = memo(SurfSpotActionsInner)

SurfSpotActions.displayName = 'SurfSpotActions'
