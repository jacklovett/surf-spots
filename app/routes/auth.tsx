import type { MetaFunction } from '@remix-run/node'
import { Link, useNavigate } from '@remix-run/react'

import { Page, Button } from '~/components'

export const meta: MetaFunction = () => {
  return [
    { title: 'Surf Spots - Login' },
    { name: 'description', content: 'Welcome to Surf Spots!' },
  ]
}

export default function Index() {
  const navigate = useNavigate()
  return (
    <Page isAlternate>
      <div className="center column">
        <img src="/images/png/logo.png" width="220" alt="Surf spots logo" />
        <div className="login-options">
          <Button
            label="Continue with Google"
            onClick={() => navigate('/surf-spots')}
            variant="alternate"
          />
          <Button
            label="Continue with Apple"
            onClick={() => navigate('/surf-spots')}
            variant="alternate"
          />
          <Button
            label="Continue with Facebook"
            onClick={() => navigate('/surf-spots')}
            variant="alternate"
          />
          <div className="row sign-up-cta">
            <p>Don't have an account? </p>
            <Link className="sign-up" to="/sign-up">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </Page>
  )
}
