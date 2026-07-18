import {
  useState,
  memo,
  useCallback,
} from 'react'
import { FetcherWithComponents } from 'react-router'

import { SurfSpot } from '~/types/surfSpots'
import { User } from '~/types/user'
import {
  ActionData,
  SurfSpotQuickActionSubmitHandler,
} from '~/types/api'
import DropdownMenu from '../DropdownMenu'
import TripSelectionModal from '../TripSelectionModal'

import {
  useSurfSpotsContext,
  useSignUpPromptContext,
  useLayoutContext,
  useToastContext,
} from '~/contexts'
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

  const { id: surfSpotId, isSurfedSpot, isWatched, createdBy } = surfSpotState

  const canEdit = user && createdBy === user.id

  const watchRowLoading = submitSpinnerTarget === 'watch'
  const surfedSpotsRowLoading = submitSpinnerTarget === 'user-spots'

  const closeTripModal = useCallback(() => setTripSelectionModalOpen(false), [])

  const handleAction = (
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
      const newValue = !surfSpotState[field]
      const updatedSurfSpot = { ...surfSpotState, [field]: newValue }

      if (!onFetcherSubmit) {
        // No fetcher — apply immediately since there is no server round-trip.
        setSurfSpotState(updatedSurfSpot)
        try {
          updateSurfSpot(surfSpotId, { [field]: newValue })
        } catch (contextError) {
          console.error('Error updating surf spot in context:', contextError)
          setSurfSpotState(surfSpot)
        }
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

        onFetcherSubmit(formData)
          .then((result) => {
            // Only update label and context once the server confirms success.
            // setSurfSpotState and updateSurfSpot are bound to this component
            // instance so they work even inside the frozen drawer ReactNode.
            if (result?.success) {
              setSurfSpotState(updatedSurfSpot)
              try {
                updateSurfSpot(surfSpotId, { [field]: newValue })
              } catch (contextError) {
                console.error('Error updating surf spot in context:', contextError)
              }
            }
          })
          .finally(() => {
            setSubmitSpinnerTarget(null)
          })
      } catch (submitError) {
        console.error('Error submitting fetcher:', submitError)
        setSubmitSpinnerTarget(null)
        throw submitError
      }
    } catch (error) {
      console.error('Error in handleAction:', error)
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
          surfSpot={surfSpotState}
          userId={user.id}
        />
      )}
    </div>
  )
})
