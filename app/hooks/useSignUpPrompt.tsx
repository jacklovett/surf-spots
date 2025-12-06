import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Modal, Button } from '~/components'
import { IModalState, initialModalState } from '~/components/Modal'

type FeatureType = 'surfed-spots' | 'watch-list' | 'add-surf-spot' | 'trips'

interface UseSignUpPromptReturn {
  showSignUpPrompt: (feature: FeatureType) => void
  modalState: IModalState
  closeModal: () => void
  SignUpPromptModal: () => JSX.Element | null
}

export const useSignUpPrompt = (): UseSignUpPromptReturn => {
  const navigate = useNavigate()
  const [modalState, setModalState] = useState<IModalState>(initialModalState)

  const getModalContent = (feature: FeatureType) => {
    switch (feature) {
      case 'watch-list':
        return {
          title: 'Sign Up to Build Your Custom Watchlist',
          content: (
            <>
              <p>With a watchlist, you could receive:</p>
              <ul className="benefits-list">
                <li>Tailored surf travel ideas</li>
                <li>Exclusive offers on accommodation and flights</li>
                <li>Updates on local events and conditions</li>
              </ul>
              <p>Ensure you never miss a thing!</p>
            </>
          ),
        }
      case 'surfed-spots':
        return {
          title: 'Sign Up to Track Your Surfed Spots',
          content: (
            <>
              <p>
                Track your surfed spots and build a personal record of your surf
                achievements.
              </p>
              <ul className="benefits-list mb">
                <li>Capture every spot you've surfed.</li>
                <li>Track your exploration progress around the globe.</li>
                <li>Discover your surf trends and favorite wave types.</li>
                <li>Share your journey with others!</li>
              </ul>
            </>
          ),
        }
      case 'add-surf-spot':
        return {
          title: 'Sign Up to Add Surf Spots',
          content: (
            <>
              <p>
                Join our community and contribute by adding new surf spots for
                others to discover.
              </p>
              <ul className="benefits-list mb">
                <li>Share your favorite surf spots with the community</li>
                <li>Help other surfers discover new waves</li>
                <li>Build your reputation as a surf spot contributor</li>
                <li>Keep your secret spots private if you prefer</li>
              </ul>
            </>
          ),
        }
      case 'trips':
        return {
          title: 'Sign Up to Plan Your Surf Trips',
          content: (
            <>
              <p>
                Create trip itineraries, plan your surf adventures, and share
                them with friends.
              </p>
              <ul className="benefits-list mb">
                <li>Plan epic surf trips with multiple spots</li>
                <li>Invite friends to join your trips</li>
                <li>Share photos and memories from your adventures</li>
                <li>Organize everything for your next surf trip in one place</li>
              </ul>
            </>
          ),
        }
    }
  }

  const showSignUpPrompt = (feature: FeatureType) => {
    const { title, content } = getModalContent(feature)
    setModalState({
      content: (
        <>
          <h2>{title}</h2>
          {content}
          <Button
            label="Create an account"
            onClick={() => {
              setModalState(initialModalState)
              navigate('/auth/sign-up')
            }}
          />
        </>
      ),
      isVisible: true,
    })
  }

  const closeModal = () => setModalState(initialModalState)

  const SignUpPromptModal = () => {
    if (!modalState.isVisible) return null
    return <Modal onClose={closeModal}>{modalState.content}</Modal>
  }

  return {
    showSignUpPrompt,
    modalState,
    closeModal,
    SignUpPromptModal,
  }
}
