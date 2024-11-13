import { MetaFunction } from '@remix-run/react'
import { Page } from '~/components'

export const meta: MetaFunction = () => {
  return [
    { title: 'Surf Spots - Settings' },
    { name: 'description', content: 'Settings controls' },
  ]
}

export default function Settings() {
  return (
    <Page showHeader>
      <div className="column center">
        <p>Settings</p>
      </div>
    </Page>
  )
}
