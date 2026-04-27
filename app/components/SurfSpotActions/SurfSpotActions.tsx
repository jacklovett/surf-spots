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
import { SurfSpotQuickActionSubmitHandler } from '~/types/api'
import { ERROR_OPEN_SESSION_LOG } from '~/utils/errorUtils'

/** Matches the `target` field sent to the surf-spot quick-action action. */
type SurfSpotQuickActionTarget = 'user-spots' | 'watch'

const TARGET_TO_SURF_SPOT_FIELD: Record<
  SurfSpotQuickActionTarget,
  keyof Pick<SurfSpot, 'isSurfedSpot' | 'isWatched'>
> = {
  'user-spots': 'isSurfedSpot',
  watch: 'isWatched',
}

interface IProps {
  surfSpot: SurfSpot
  navigate: (path: string) => void
  user: User | null
  onFetcherSubmit?: SurfSpotQuickActionSubmitHandler
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
  /** Which watch/surfed row shows the spinner while the fetcher is in action. */
  const [submitSpinnerTarget, setSubmitSpinnerTarget] =
    useState<SurfSpotQuickActionTarget | null>(null)

  const { updateSurfSpot } = useSurfSpotsContext()
  const { showSignUpPrompt } = useSignUpPromptContext()
  const { closeDrawer } = useLayoutContext()
  const { showError } = useToastContext()

  const lastSurfActionDataRef = useRef(surfActionFetcher?.data)

  const { id: surfSpotId, isSurfedSpot, isWatched, createdBy } = surfSpotState

  const canEdit = user && createdBy === user.id

  const watchRowLoading = submitSpinnerTarget === 'watch'
  const surfedSpotsRowLoading = submitSpinnerTarget === 'user-spots'

  useEffect(() => {
    setSurfSpotState(surfSpot)
  }, [surfSpot])

  // Track last action response for toast consumers; clear row spinner when fetcher settles.
  useEffect(() => {
    if (!surfActionFetcher) return

    if (surfActionFetcher.state === 'idle') {
      setSubmitSpinnerTarget(null)
      if (
        surfActionFetcher.data &&
        surfActionFetcher.data !== lastSurfActionDataRef.current
      ) {
        lastSurfActionDataRef.current = surfActionFetcher.data
      }
    }

    if (
      surfActionFetcher.state === 'submitting' ||
      surfActionFetcher.state === 'loading'
    ) {
      lastSurfActionDataRef.current = undefined
    }
  }, [surfActionFetcher?.data, surfActionFetcher?.state, surfActionFetcher])

  const closeTripModal = useCallback(() => setTripSelectionModalOpen(false), [])

  const handleAction = async (
    actionType: 'add' | 'remove',
    target: SurfSpotQuickActionTarget,
  ) => {
    try {
      if (submitSpinnerTarget !== null) {
        return
      }

      if (!user) {
        showSignUpPrompt(target === 'watch' ? 'watch-list' : 'surfed-spots')
        return
      }

      const field = TARGET_TO_SURF_SPOT_FIELD[target]
      const currentValue = surfSpotState[field]
      const newValue = !currentValue

      const updatedSurfSpot = {
        ...surfSpotState,
        [field]: newValue,
      }

      setSurfSpotState(updatedSurfSpot)

      try {
        updateSurfSpot(surfSpotId, { [field]: newValue })
      } catch (contextError) {
        console.error('Error updating surf spot in context:', contextError)
        setSurfSpotState(surfSpot)
      }

      if (!onFetcherSubmit) {
        return
      }

      try {
        if (surfActionFetcher) {
          setSubmitSpinnerTarget(target)
        }
        const formData = new FormData()
        formData.append('actionType', actionType)
        formData.append('target', target)
        formData.append('surfSpotId', surfSpotId)
        const submitOutcome = onFetcherSubmit(formData)
        if (submitOutcome instanceof Promise) {
          submitOutcome.finally(() => {
            setSubmitSpinnerTarget(null)
          })
        }
      } catch (submitError) {
        console.error('Error submitting fetcher:', submitError)
        setSurfSpotState(surfSpot)
        setSubmitSpinnerTarget(null)
        throw submitError
      }
    } catch (error) {
      console.error('Error in handleAction:', error)
      setSurfSpotState(surfSpot)
      setSubmitSpinnerTarget(null)
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
      loading: watchRowLoading,
      onClick: () => handleAction(isWatched ? 'remove' : 'add', 'watch'),
      closeOnClick: false,
    },
    {
      label: isSurfedSpot ? 'Remove from surfed spots' : 'Add to surfed spots',
      iconKey: isSurfedSpot ? 'bin' : 'plus',
      loading: surfedSpotsRowLoading,
      onClick: () =>
        handleAction(isSurfedSpot ? 'remove' : 'add', 'user-spots'),
      closeOnClick: false,
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
    <div className="actions">
      <DropdownMenu items={menuItems} align="right" />
      {user?.id && (
        <TripSelectionModal
          isOpen={tripSelectionModalOpen}
          onClose={closeTripModal}
          onError={showError}
          surfSpot={surfSpotState}
          userId={user.id}
        />
      )}
    </div>
  )
})

SurfSpotActions.displayName = 'SurfSpotActions'
