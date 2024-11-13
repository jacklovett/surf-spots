import { ReactNode, useState } from 'react'
import { post, deleteData } from '~/services/networkService'
import { SurfSpot } from '~/types/surfSpots'
import { User } from '~/types/user'
import { Button, Modal, TextButton } from '../index'

interface IProps {
  surfSpot: SurfSpot
  navigate: (path: string) => void
  user: User | null
}

interface IModalState {
  content: ReactNode
  isVisible: boolean
}

const initialModalState: IModalState = {
  content: null,
  isVisible: false,
}

export const SurfSpotActions = ({ surfSpot, navigate, user }: IProps) => {
  const { id: surfSpotId, isSurfedSpot, isWatching } = surfSpot
  const [modalState, setModalState] = useState<IModalState>(initialModalState)

  const userSpotRequest = user && {
    userId: user.id,
    surfSpotId,
  }

  const handleAction = async (
    actionType: 'add' | 'remove',
    target: 'user-spots' | 'watch',
  ) => {
    if (userSpotRequest) {
      const endpoint =
        actionType === 'add'
          ? target
          : `${target}/${userSpotRequest.userId}/remove/${userSpotRequest.surfSpotId}`
      const requestMethod = actionType === 'add' ? post : deleteData

      try {
        await requestMethod(
          endpoint,
          actionType === 'add' ? userSpotRequest : undefined,
        )
      } catch (error) {
        console.error('Unable to perform action:', error)
      }
    } else {
      showSignUpPromptModal(target === 'watch')
    }
  }

  const showSignUpPromptModal = (isWatchAction: boolean) => {
    const title = isWatchAction
      ? 'Sign Up to Build Your Custom Watchlist'
      : 'Sign up to Track Your Surfed Spots'
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
          <li>Capture every spot you’ve surfed.</li>
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
      {!isWatching && !isSurfedSpot && (
        <TextButton
          text="Add to watch list"
          onClick={() => handleAction('add', 'watch')}
          iconKey="heart"
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
      {isWatching && (
        <TextButton
          text="Remove from watch list"
          onClick={() => handleAction('remove', 'watch')}
          iconKey="bin"
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
}
