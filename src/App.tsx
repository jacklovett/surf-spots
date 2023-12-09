import React, { useState, useEffect } from 'react'
import './App.css'
import { SurfSpot, getAllSurfSpots } from './Controllers/surfSpotsController'

function App() {
  const [surfSpots, setSurfSpots] = useState<SurfSpot[]>([])

  useEffect(() => {
    const fetchSurfSpots = async () => {
      try {
        const surfSpotsData = await getAllSurfSpots()
        setSurfSpots(surfSpotsData)
      } catch (error) {
        console.error('Error fetching surf spots:', error)
      }
    }

    fetchSurfSpots()
  }, []) // The empty dependency array ensures that this effect runs only once, similar to componentDidMount

  return (
    <div className="App">
      <header className="App-header">
        <h1>SurfSpots</h1>
        {surfSpots.length > 0 && (
          <ul>
            {surfSpots.map(surfSpot => (
              <li key={surfSpot.id}>{surfSpot.name}</li>
            ))}
          </ul>
        )}
        {surfSpots.length === 0 && <p>No surf spots found</p>}
      </header>
    </div>
  )
}

export default App
