import { Link, useNavigate } from '@remix-run/react'
import { useUser } from '~/contexts/UserContext'

import Menu from '../Menu'

export const Header = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const isLoggedIn = !!user

  return (
    <header className="header space-between">
      <div className="center logo" onClick={() => navigate('/')}>
        <img src="/images/png/logo-no-text.png" alt="Logo" height="40" />
        <h2>Surf Spots</h2>
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
