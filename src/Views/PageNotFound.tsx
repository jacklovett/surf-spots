import { useNavigate } from 'react-router-dom'

import { Button, Page } from '../Components'

const PageNotFound = () => {
  const navigate = useNavigate()
  return (
    <Page
      content={
        <div className="center column">
          <h1>404: Page not found</h1>
          <p>Looks like you've explored too much!</p>
          <Button label="Go Back" onClick={() => navigate('/')} />
        </div>
      }
    />
  )
}
export default PageNotFound
