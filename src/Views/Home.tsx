import { useNavigate } from 'react-router-dom'

import { Button, Page } from '../Components'

const Home = () => {
  const navigate = useNavigate()
  return (
    <Page
      isAlternate
      content={
        <div className="center column">
          <img src="/images/png/logo.png" width="240" alt="Surf spots logo" />
          <p className="description">
            Track all your past surf destinations and explore new ones, all in
            one place.
          </p>
          <Button
            label="Get Started!"
            onClick={() => navigate('/surf-spots')}
            variant="alternate"
          />
        </div>
      }
    />
  )
}

export default Home
