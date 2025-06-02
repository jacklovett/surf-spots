import type { LinksFunction, MetaFunction } from 'react-router'

import { Page, NavButton } from '~/components'

export const meta: MetaFunction = () => {
  return [
    { title: 'Surf Spots - Home' },
    { name: 'description', content: 'Welcome to Surf Spots!' },
  ]
}

export const links: LinksFunction = () => [
  {
    rel: 'preload',
    href: '/images/png/logo.png',
    as: 'image',
    type: 'image/png',
  },
]

export default function Index() {
  return (
    <Page isAlternate>
      <section className="center column h-full content mt">
        <div className="page-content">
          <div className="column center">
            <img src="/images/png/logo.png" width="240" alt="Surf spots logo" />
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
      </section>
    </Page>
  )
}
