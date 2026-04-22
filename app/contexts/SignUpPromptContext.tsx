import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Modal, Button } from '~/components'

export type FeatureType =
  | 'surfed-spots'
  | 'watch-list'
  | 'add-surf-spot'
  | 'trips'
  | 'surfboards'
  | 'sessions'
  | 'notes'

interface SignUpPromptContextType {
  showSignUpPrompt: (feature: FeatureType) => void
  closeModal: () => void
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
  const location = useLocation()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState<FeatureType | null>(null)
  const [isNavigatingToSignUp, setIsNavigatingToSignUp] = useState(false)

  const getModalContent = (feature: FeatureType) => {
    switch (feature) {
      case 'watch-list':
        return {
          title: 'Sign Up to Build Your Watch List',
          content: (
            <>
              <p>With a watch list, you can receive:</p>
              <ul className="benefits-list">
                <li>Surf travel ideas tailored to you</li>
                <li>Updates on local events and conditions</li>
                <li>Offers on accommodation and flights</li>
              </ul>
              <p>Never miss an update on the spots you follow.</p>
            </>
          ),
        }
      case 'surfed-spots':
        return {
          title: 'Sign Up to Track Your Surfed Spots',
          content: (
            <>
              <p>
                Record every spot you have surfed and build your personal surf
                history.
              </p>
              <ul className="benefits-list">
                <li>Capture every spot you have surfed.</li>
                <li>Track your exploration across the globe.</li>
                <li>Discover your favorite wave types and breaks.</li>
                <li>Share your journey with others.</li>
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
                Add new surf spots for others to explore and discover.
              </p>
              <ul className="benefits-list">
                <li>Share your favorite spots with other surfers</li>
                <li>Help others discover new waves</li>
                <li>Add spots and grow the map</li>
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
                Create trips, plan surf adventures, and share them with friends.
              </p>
              <ul className="benefits-list">
                <li>Plan trips with multiple spots</li>
                <li>Invite friends to join your trips</li>
                <li>Share photos and memories from your adventures</li>
                <li>Keep your next surf trip in one place</li>
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
      case 'sessions':
        return {
          title: 'Sign Up to Track Your Sessions',
          content: (
            <>
              <p>Save every surf session and build your personal timeline.</p>
              <ul className="benefits-list">
                <li>See all your sessions in one place</li>
                <li>Track wave quality and crowd patterns</li>
                <li>Remember the board you rode</li>
                <li>Build a clean history of your progression</li>
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
                Save notes about surf spots to remember your experiences and
                preferences.
              </p>
              <ul className="benefits-list">
                <li>Write personal notes about each spot</li>
                <li>Remember conditions, tides, and board choices</li>
                <li>Keep private notes that only you can see</li>
              </ul>
            </>
          ),
        }
      default:
        return {
          title: 'Sign Up to Get Started',
          content: <p>Create an account to get started.</p>,
        }
    }
  }

  const showSignUpPrompt = useCallback((feature: FeatureType) => {
    setSelectedFeature(feature)
    setIsModalVisible(true)
    setIsNavigatingToSignUp(false)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalVisible(false)
    setSelectedFeature(null)
    setIsNavigatingToSignUp(false)
  }, [])

  const handleCreateAccount = useCallback(() => {
    setIsNavigatingToSignUp(true)
    navigate('/auth/sign-up')
  }, [navigate])

  useEffect(() => {
    if (!isNavigatingToSignUp || location.pathname !== '/auth/sign-up') {
      return
    }

    setIsModalVisible(false)
    setSelectedFeature(null)
    setIsNavigatingToSignUp(false)
  }, [isNavigatingToSignUp, location.pathname])

  const shouldShowModal = isModalVisible && !!selectedFeature
  const modalContent = selectedFeature ? getModalContent(selectedFeature) : null

  return (
    <SignUpPromptContext.Provider
      value={{
        showSignUpPrompt,
        closeModal,
      }}
    >
      {children}
      {shouldShowModal && modalContent && (
        <Modal onClose={closeModal}>
          <>
            <h2>{modalContent.title}</h2>
            <div className="modal-scrollable-content">
              {modalContent.content}
            </div>
            <div className="modal-footer">
              <Button
                label="Create account"
                onClick={handleCreateAccount}
                loading={isNavigatingToSignUp}
              />
            </div>
          </>
        </Modal>
      )}
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
