import React from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Page } from '../Components'

const Home = () => {
  const navigate = useNavigate()
  return (
    <Page
      title="Welcome to Surf Spots"
      content={
        <div className="center column">
          <p className="description mb-1">
            Discover the best surf spots around the world and share your
            favorites with the community.
          </p>
          <Button label="Get Started!" onClick={() => navigate('/overview')} />
        </div>
      }
    />
  )
}

export default Home
