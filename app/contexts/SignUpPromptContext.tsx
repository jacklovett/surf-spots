import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
} from 'react'
import { useNavigate } from 'react-router'
import { Modal, Button } from '~/components'
import { IModalState, initialModalState } from '~/components/Modal'

export type FeatureType =
  | 'surfed-spots'
  | 'watch-list'
  | 'add-surf-spot'
  | 'trips'
  | 'surfboards'
  | 'notes'

interface SignUpPromptContextType {
  showSignUpPrompt: (feature: FeatureType) => void
  modalState: IModalState
  closeModal: () => void
  SignUpPromptModal: () => JSX.Element | null
}

const SignUpPromptContext = createContext<SignUpPromptContextType | undefined>(
  undefined,
)

interface SignUpPromptProviderProps {
  children: ReactNode
}

export const SignUpPromptProvider = ({
  children,
}: SignUpPromptProviderProps) => {
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
          title: 'Sign Up to Record Your Surfed Spots',
          content: (
            <>
              <p>
                Record your surfed spots and build a personal record of your surf
                achievements.
              </p>
              <ul className="benefits-list">
                <li>Capture every spot you've surfed.</li>
                <li>Monitor your exploration progress around the globe.</li>
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
              <ul className="benefits-list">
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
              <ul className="benefits-list">
                <li>Plan epic surf trips with multiple spots</li>
                <li>Invite friends to join your trips</li>
                <li>Share photos and memories from your adventures</li>
                <li>
                  Organize everything for your next surf trip in one place
                </li>
              </ul>
            </>
          ),
        }
      case 'surfboards':
        return {
          title: 'Sign Up to Manage Your Surfboards',
          content: (
            <>
              <p>Manage your surfboard collection and organize all your boards.</p>
              <ul className="benefits-list">
                <li>Catalog all your surfboards in one place</li>
                <li>Record dimensions, volume, and specifications</li>
                <li>Add photos and link to shaper pages</li>
                <li>Plan which boards to bring on trips</li>
              </ul>
            </>
          ),
        }
      case 'notes':
        return {
          title: 'Sign Up to Add Personal Notes',
          content: (
            <>
              <p>
                Save personal notes about surf spots to remember your experiences
                and preferences and start building your own local knowledge base.
              </p>
              <ul className="benefits-list">
                <li>Write personal notes about each surf spot</li>
                <li>Remember your preferred conditions, tides, and board choices</li>
                <li>Keep private insights that only you can see</li>
              </ul>
            </>
          ),
        }
      default:
        return {
          title: 'Sign Up to Get Started',
          content: <p>Create an account to access this feature.</p>,
        }
    }
  }

  const showSignUpPrompt = useCallback((feature: FeatureType) => {
    const { title, content } = getModalContent(feature)
    setModalState({
      content: (
        <>
          <h2>{title}</h2>
          <div className="modal-scrollable-content">
            {content}
          </div>
          <div className="modal-footer">
            <Button
              label="Create an account"
              onClick={() => {
                setModalState(initialModalState)
                navigate('/auth/sign-up')
              }}
            />
          </div>
        </>
      ),
      isVisible: true,
    })
  }, [navigate])

  const closeModal = useCallback(() => {
    setModalState(initialModalState)
  }, [])

  const SignUpPromptModal = useCallback(() => {
    if (!modalState.isVisible) return null
    return <Modal onClose={closeModal}>{modalState.content}</Modal>
  }, [modalState, closeModal])

  return (
    <SignUpPromptContext.Provider
      value={{
        showSignUpPrompt,
        modalState,
        closeModal,
        SignUpPromptModal,
      }}
    >
      {children}
    </SignUpPromptContext.Provider>
  )
}

export const useSignUpPromptContext = () => {
  const context = useContext(SignUpPromptContext)
  if (context === undefined) {
    throw new Error(
      'useSignUpPromptContext must be used within a SignUpPromptProvider',
    )
  }
  return context
}
