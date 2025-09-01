import classNames from 'classnames'
import { Icon, SocialLinks } from '../index'

export const COPYRIGHT_TEXT = `© ${new Date().getFullYear()} Surf Spots. All rights reserved.`

interface IProps {
  isAlternate: boolean
}

export const Footer = ({ isAlternate }: IProps) => (
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

        <div className="footer-section">
          <h4>App</h4>
          <ul>
            <li>
              <a href="/surf-spots">Surf Spots</a>
            </li>
            <li>
              <a href="/surfed-spots">Surfed Spots</a>
            </li>
            <li>
              <a href="/watch-list">Watch List</a>
            </li>
            <li>
              <a href="/add-surf-spot">Add Spot</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
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
        </div>

        <div className="footer-section">
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
        </div>
      </div>

      <div className="footer-bottom">
        <p>{COPYRIGHT_TEXT}</p>
      </div>
    </div>
  </footer>
)
