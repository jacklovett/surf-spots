import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [backendResponse, setBackendResponse] = useState<string>('')

  useEffect(() => {
    // Make a GET request to your backend endpoint
    fetch('http://localhost:3001/') // Assuming your backend is running on localhost:3001
      .then(response => response.text())
      .then(data => {
        setBackendResponse(data)
      })
      .catch(error => {
        console.error('Error fetching data from backend:', error)
      })
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>SurfSpots</h1>
        <p>{backendResponse}</p>
      </header>
    </div>
  )
}

export default App
