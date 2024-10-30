import { Link } from '@remix-run/react'
import Menu from '../Menu'
import { useUser } from '~/contexts/UserContext'

interface IProps {
  navigate: (path: string) => void
}

export const Header = (props: IProps) => {
  const { navigate } = props
  const { user } = useUser()
  const isLoggedIn = !!user

  return (
    <header className="header space-between">
      <div className="center logo" onClick={() => navigate('/')}>
        {/* TODO: Replace logo (Don't use Favicon!) */}
        <img src="/favicon.ico" alt="Logo" height="40" />
        <h2>Surf Spots</h2>
      </div>
      {isLoggedIn ? (
        <Menu />
      ) : (
        <div className="sign-in-nav">
          <Link to="/auth">Sign in</Link>
        </div>
      )}
    </header>
  )
}
