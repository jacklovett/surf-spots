import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { AppDispatch } from '../../Store'

import { SurfSpot } from '../../Controllers/surfSpotsTypes'
import { fetchAllSurfSpots, selectSurfSpotsState } from '../../Store/surfSpots'
import Button from '../Button'

const SurfSpotList = (): JSX.Element => {
  const dispatch: AppDispatch = useDispatch()
  const navigate = useNavigate()
  const surfSpotsState = useSelector(selectSurfSpotsState)
  const { data, loading, error } = surfSpotsState

  const [selectedSurfSpot, setSelectedSurfSpot] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchAllSurfSpots()) // Dispatch the thunk to fetch surf spots
  }, [dispatch])

  const renderContent = () => {
    if (loading) {
      return <p className="status-message">Loading...</p>
    }

    if (error) {
      return <p className="status-message error">Error: {error}</p>
    }

    if (data?.length === 0) {
      return <p className="status-message">No surf spots found</p>
    }

    return (
      <ul className="surf-spot-list">
        {data?.map((surfSpot: SurfSpot) => {
          const { id, name } = surfSpot
          return (
            <li key={id} className="list-item">
              <button
                className={`select-button ${
                  selectedSurfSpot === id ? 'selected' : ''
                }`}
                onClick={() =>
                  setSelectedSurfSpot(selectedSurfSpot === id ? null : id)
                }
              >
                {name}
              </button>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="surf-spot-container">
      <header className="App-header">
        <h1>Surf Spots</h1>
      </header>
      <div className="actions">
        <Button onClick={() => navigate('/add-surf-spot')} label="Add" />
        {selectedSurfSpot && (
          <Button
            onClick={() => navigate(`/edit-surf-spot/${selectedSurfSpot}`)}
            label="Edit"
          />
        )}
      </div>
      <div className="content-container">{renderContent()}</div>
    </div>
  )
}

export default SurfSpotList
