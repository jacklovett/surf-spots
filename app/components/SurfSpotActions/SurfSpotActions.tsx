import { useState, memo } from 'react'

import { SurfSpot } from '~/types/surfSpots'
import { User } from '~/types/user'
import Button from '../Button'
import Modal from '../Modal'
import TextButton from '../TextButton'
import { IModalState, initialModalState } from '../Modal'

import { FetcherSubmitParams } from './index'

interface IProps {
  surfSpot: SurfSpot
  navigate: (path: string) => void
  user: User | null
  onFetcherSubmit?: (params: FetcherSubmitParams) => void
  onSurfSpotUpdate?: (updatedSurfSpot: SurfSpot) => void
}

export const SurfSpotActions = memo((props: IProps) => {
  const { surfSpot, navigate, user, onFetcherSubmit, onSurfSpotUpdate } = props
  const [modalState, setModalState] = useState<IModalState>(initialModalState)
  const [surfSpotState, setSurfSpotState] = useState<SurfSpot>(surfSpot)

  const { id: surfSpotId, isSurfedSpot, isWatched, createdBy } = surfSpotState

  const canEdit = user && createdBy === user?.id

  const handleAction = async (
    actionType: 'add' | 'remove',
    target: 'user-spots' | 'watch',
  ) => {
    if (user) {
      // Submit the action to the server
      if (onFetcherSubmit) {
        const formData = new FormData()
        formData.append('actionType', actionType)
        formData.append('target', target)
        formData.append('surfSpotId', surfSpotId.toString())
        onFetcherSubmit(formData)
      } else {
        console.warn('onFetcherSubmit is not available')
      }

      // Update local state optimistically
      let updatedSurfSpot = surfSpotState
      if (target === 'user-spots') {
        updatedSurfSpot = {
          ...surfSpotState,
          isSurfedSpot: !surfSpotState.isSurfedSpot,
        }
      }

      if (target === 'watch') {
        updatedSurfSpot = {
          ...surfSpotState,
          isWatched: !surfSpotState.isWatched,
        }
      }

      setSurfSpotState(updatedSurfSpot)

      // Update parent's surf spot data
      if (onSurfSpotUpdate) {
        onSurfSpotUpdate(updatedSurfSpot)
      }
    } else {
      showSignUpPromptModal(target === 'watch')
    }
  }

  const showSignUpPromptModal = (isWatchAction: boolean) => {
    const title = isWatchAction
      ? 'Sign Up to Build Your Custom Watchlist'
      : 'Sign Up to Track Your Surfed Spots'

    const watchlistContent = (
      <>
        <p>With a watchlist, you could receive:</p>
        <ul className="benefits-list">
          <li>Tailored surf travel ideas</li>
          <li>Exclusive offers on accommodation and flights</li>
          <li>Updates on local events and conditions</li>
        </ul>
        <p>Ensure you never miss a thing!</p>
      </>
    )
    const surfedSpotContent = (
      <>
        <p>
          Add this spot to your surfed list and build a personal record of your
          surf achievements.
        </p>
        <ul className="benefits-list mb">
          <li>Capture every spot you've surfed.</li>
          <li>Track your exploration progress around the globe.</li>
          <li>Discover your surf trends and favorite wave types.</li>
          <li>Share your journey with others!</li>
        </ul>
      </>
    )

    setModalState({
      content: (
        <>
          <h2>{title}</h2>
          {isWatchAction ? watchlistContent : surfedSpotContent}
          <Button
            label="Create an account"
            onClick={() => navigate('/auth/sign-up')}
          />
        </>
      ),
      isVisible: true,
    })
  }

  return (
    <div className="actions">
      {!isWatched && (
        <TextButton
          text="Add to watch list"
          onClick={() => handleAction('add', 'watch')}
          iconKey="heart"
          filled
        />
      )}
      {isWatched && (
        <TextButton
          text="Remove from watch list"
          onClick={() => handleAction('remove', 'watch')}
          iconKey="bin"
          filled
        />
      )}
      {!isSurfedSpot && (
        <TextButton
          text="Add to surfed spots"
          onClick={() => handleAction('add', 'user-spots')}
          iconKey="plus"
          filled
        />
      )}
      {isSurfedSpot && (
        <TextButton
          text="Remove from surfed spots"
          onClick={() => handleAction('remove', 'user-spots')}
          iconKey="bin"
          filled
        />
      )}
      {canEdit && (
        <TextButton
          text="Edit surf spot"
          onClick={() => navigate(`/edit-surf-spot/${surfSpot.id}`)}
          iconKey="plus" // TODO: Create edit icon
          filled
        />
      )}
      {modalState.isVisible && (
        <Modal onClose={() => setModalState(initialModalState)}>
          {modalState.content}
        </Modal>
      )}
    </div>
  )
})

SurfSpotActions.displayName = 'SurfSpotActions'
