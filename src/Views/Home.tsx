import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div>
      <header className="header">
        <h1>Welcome to Surf Spots</h1>
      </header>
      <div className="actions">
        <Link to="/add" className="action-button">
          Add Surf Spot
        </Link>
      </div>
      <div className="content-container"></div>
    </div>
  )
}

export default Home
