import { MouseEvent } from 'react'
import classNames from 'classnames'
import { SocialLinks } from '../index'
import { useUserContext } from '~/contexts'
import { useAuthModal } from '~/hooks/useAuthModal'

export const COPYRIGHT_TEXT = `© ${new Date().getFullYear()} Surf Spots. All rights reserved.`

interface IProps {
  isAlternate: boolean
}

export const Footer = ({ isAlternate }: IProps) => {
  const { user } = useUserContext()
  const { showAuthModal, AuthModal } = useAuthModal()

  // Map of protected routes to their route identifiers
  const protectedRoutes: Record<
    string,
    'surfed-spots' | 'watch-list' | 'add-surf-spot'
  > = {
    '/surfed-spots': 'surfed-spots',
    '/watch-list': 'watch-list',
    '/add-surf-spot': 'add-surf-spot',
  }

  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>, path: string) => {
    const routeKey = protectedRoutes[path]
    if (routeKey && !user) {
      e.preventDefault()
      showAuthModal(routeKey)
      return
    }
    // Allow default navigation for non-protected routes or authenticated users
  }

  return (
    <footer
      className={classNames('footer', {
        alternate: isAlternate,
      })}
    >
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Surf Spots</h3>
            <p>
              Track your surf journey, discover new spots, and plan future
              adventures.
            </p>
            <SocialLinks />
          </div>

          <nav className="footer-section" aria-label="App navigation">
            <h4>App</h4>
            <ul>
              <li>
                <a href="/surf-spots">Surf Spots</a>
              </li>
              <li>
                <a
                  href="/surfed-spots"
                  onClick={(e) => handleLinkClick(e, '/surfed-spots')}
                >
                  Surfed Spots
                </a>
              </li>
              <li>
                <a
                  href="/watch-list"
                  onClick={(e) => handleLinkClick(e, '/watch-list')}
                >
                  Watch List
                </a>
              </li>
              <li>
                <a
                  href="/add-surf-spot"
                  onClick={(e) => handleLinkClick(e, '/add-surf-spot')}
                >
                  Add Spot
                </a>
              </li>
              <li>
                <a href="/trip-planner">Trip Planner</a>
              </li>
            </ul>
          </nav>

          <nav className="footer-section" aria-label="Account navigation">
            <h4>Account</h4>
            <ul>
              <li>
                <a href="/profile">Profile</a>
              </li>
              <li>
                <a href="/settings">Settings</a>
              </li>
              <li>
                <a href="/auth">Login</a>
              </li>
              <li>
                <a href="/auth/sign-up">Sign Up</a>
              </li>
            </ul>
          </nav>

          <nav className="footer-section" aria-label="Information">
            <h4>Info</h4>
            <ul>
              <li>
                <a href="/about-us">About Us</a>
              </li>
              <li>
                <a href="/data-policy">Data Policy</a>
              </li>
              <li>
                <a href="/contact">Contact</a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="footer-bottom">
          <p>{COPYRIGHT_TEXT}</p>
        </div>
        <AuthModal />
      </div>
    </footer>
  )
}
