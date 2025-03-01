import { MetaFunction, useNavigate } from 'react-router'

import { Page, Button } from '~/components'

export const meta: MetaFunction = () => {
  return [
    { title: 'Surf Spots - 404' },
    { name: 'description', content: 'Page not found' },
  ]
}

export default function PageNotFound() {
  const navigate = useNavigate()
  return (
    <Page isAlternate>
      <div className="center column">
        <h1>404: Page not found</h1>
        <p className="mb">Looks like you've explored too much!</p>
        <Button
          label="Go Back"
          onClick={() => navigate(-1)}
          variant="alternate"
        />
      </div>
    </Page>
  )
}
