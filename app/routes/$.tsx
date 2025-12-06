import { MetaFunction, useNavigate } from 'react-router'

import { Page, Button, Icon } from '~/components'

export const meta: MetaFunction = () => {
  return [
    { title: 'Surf Spots - 404' },
    { name: 'description', content: 'Page not found' },
  ]
}

export default function PageNotFound() {
  const navigate = useNavigate()

  const handleGoBack = () => navigate(-1)

  return (
    <Page showHeader>
      <div className="center column h-full">
        <div className="center column">
          <Icon iconKey="error" useAccentColor />
          <h1>404: Page not found</h1>
          <p className="mb">Looks like you've explored too much!</p>
          <Button label="Go Back" onClick={handleGoBack} variant="secondary" />
        </div>
      </div>
    </Page>
  )
}
