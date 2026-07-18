import { MouseEvent } from 'react'
import classNames from 'classnames'
import { Link } from 'react-router'
import { SocialLinks } from '../index'
import { useUserContext, useSignUpPromptContext } from '~/contexts'
import { scrollPageToTop } from '~/utils/scrollPageToTop'

export const COPYRIGHT_TEXT = `© ${new Date().getFullYear()} Surf Spots. All rights reserved.`

interface IProps {
  isAlternate: boolean
}

export const Footer = ({ isAlternate }: IProps) => {
  const { user } = useUserContext()
  const { showSignUpPrompt } = useSignUpPromptContext()

  // Map of protected routes to their route identifiers
  const protectedRoutes: Record<
    string,
    | 'surfed-spots'
    | 'watch-list'
    | 'add-surf-spot'
    | 'trips'
    | 'surfboards'
    | 'sessions'
  > = {
    '/surfed-spots': 'surfed-spots',
    '/watch-list': 'watch-list',
    '/add-surf-spot': 'add-surf-spot',
    '/trips': 'trips',
    '/surfboards': 'surfboards',
    '/sessions': 'sessions',
  }

  const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>, path: string) => {
    const routeKey = protectedRoutes[path]
    if (routeKey && !user) {
      event.preventDefault()
      showSignUpPrompt(routeKey)
      return
    }
    scrollPageToTop()
  }

  const protectedLinkProps = (path: string) => ({
    to: path,
    prefetch: 'intent' as const,
    'data-suppress-scroll-on-navigate': true,
    onClick: (event: MouseEvent<HTMLAnchorElement>) => handleLinkClick(event, path),
  })

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
              Build your surf history, discover new spots, and plan your next
              adventure.
            </p>
            <SocialLinks />
          </div>

          <nav className="footer-section" aria-label="Spots navigation">
            <h4>Spots</h4>
            <ul>
              <li>
                <Link to="/surf-spots" prefetch="intent">
                  Surf Spots
                </Link>
              </li>
              <li>
                <Link {...protectedLinkProps('/surfed-spots')}>Surfed Spots</Link>
              </li>
              <li>
                <Link {...protectedLinkProps('/watch-list')}>Watch List</Link>
              </li>
              <li>
                <Link {...protectedLinkProps('/add-surf-spot')}>Add Spot</Link>
              </li>
              <li>
                <Link to="/trip-planner" prefetch="intent">
                  Trip Planner
                </Link>
              </li>
            </ul>
          </nav>

          <nav className="footer-section" aria-label="Collections navigation">
            <h4>Collections</h4>
            <ul>
              <li>
                <Link {...protectedLinkProps('/sessions')}>Sessions</Link>
              </li>
              <li>
                <Link {...protectedLinkProps('/trips')}>Trips</Link>
              </li>
              <li>
                <Link {...protectedLinkProps('/surfboards')}>Surfboards</Link>
              </li>
            </ul>
          </nav>

          <nav className="footer-section" aria-label="Account navigation">
            <h4>Account</h4>
            <ul>
              <li>
                <Link to="/profile" prefetch="intent">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/settings" prefetch="intent">
                  Settings
                </Link>
              </li>
              <li>
                <Link to="/auth" prefetch="intent">
                  Sign in
                </Link>
              </li>
              <li>
                <Link to="/auth/sign-up" prefetch="intent">
                  Sign Up
                </Link>
              </li>
            </ul>
          </nav>

          <nav className="footer-section" aria-label="Information">
            <h4>Info</h4>
            <ul>
              <li>
                <Link to="/about-us" prefetch="intent">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/faq" prefetch="intent">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/data-policy" prefetch="intent">
                  Data Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" prefetch="intent">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="footer-bottom">
          <p>{COPYRIGHT_TEXT}</p>
        </div>
      </div>
    </footer>
  )
}
