import { Link } from '@remix-run/react'
import Menu from '../Menu'

interface IProps {
  isLoggedIn: boolean
  navigate: (path: string) => void
}

export const Header = ({ isLoggedIn, navigate }: IProps) => (
  <header className="header space-between">
    <div className="center logo" onClick={() => navigate('/')}>
      {/* TODO: Replace logo (Don't use Favicon!) */}
      <img src="/favicon.ico" alt="Logo" height="40" />
      <h2>Surf Spots</h2>
    </div>
    {isLoggedIn ? (
      <Menu />
    ) : (
      <div className="login-nav">
        <Link to="/auth">Login</Link>
        <Link to="/auth">Sign up</Link>
      </div>
    )}
  </header>
)
