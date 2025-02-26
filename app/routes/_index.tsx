import type { MetaFunction } from '@remix-run/node'

import { Page, NavButton } from '~/components'

export const meta: MetaFunction = () => {
  return [
    { title: 'Surf Spots - Home' },
    { name: 'description', content: 'Welcome to Surf Spots!' },
  ]
}

export default function Index() {
  return (
    <Page isAlternate>
      <div className="center column content">
        <img src="/images/png/logo.png" width="240" alt="Surf spots logo" />
        <div className="page-content">
          <p className="description alternate">
            Track all your past surf destinations and explore new ones, all in
            one place.
          </p>
          <NavButton
            label="Take a look!"
            to="/surf-spots"
            variant="alternate"
          />
        </div>
      </div>
    </Page>
  )
}
