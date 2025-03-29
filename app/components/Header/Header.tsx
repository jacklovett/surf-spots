import { Link, useNavigate } from 'react-router'
import { useUser } from '~/contexts/UserContext'

import Menu from '../Menu'

export const Header = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const isLoggedIn = !!user

  return (
    <header className="header space-between">
      <div className="center logo" onClick={() => navigate('/')}>
        <img src="/images/png/logo-with-text.png" alt="Logo" />
      </div>
      {isLoggedIn ? (
        <Menu />
      ) : (
        <div className="sign-in-nav">
          <Link to="/auth" prefetch="intent">
            Sign in
          </Link>
        </div>
      )}
    </header>
  )
}
