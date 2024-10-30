import type { MetaFunction } from '@remix-run/node'
import { useNavigate } from '@remix-run/react'

import { Page, Button } from '~/components'

export const meta: MetaFunction = () => {
  return [
    { title: 'Surf Spots - Home' },
    { name: 'description', content: 'Welcome to Surf Spots!' },
  ]
}

export default function Index() {
  const navigate = useNavigate()
  return (
    <Page isAlternate>
      <div className="center column content">
        <img src="/images/png/logo.png" width="240" alt="Surf spots logo" />
        <div className="auth-container">
          <p className="description alternate">
            Track all your past surf destinations and explore new ones, all in
            one place.
          </p>
          <Button
            label="Take a look!"
            onClick={() => navigate('/surf-spots')}
            variant="alternate"
          />
        </div>
      </div>
    </Page>
  )
}
