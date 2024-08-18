import { useDispatch, useSelector } from 'react-redux'
import { Page, SurfSpotList, Widget } from '../Components'
import { fetchAllSurfSpots, selectSurfSpotsState } from '../Store/surfSpots'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppDispatch } from '../Store'
import { SurfSpot } from '../Controllers/surfSpotController'

const Overview = () => {
  const dispatch: AppDispatch = useDispatch()
  const navigate = useNavigate()

  const { data, error, loading } = useSelector(selectSurfSpotsState)
  const surfSpots = data

  const [selectedSurfSpot, setSelectedSurfSpot] = useState<SurfSpot | null>(
    null,
  )

  useEffect(() => {
    dispatch(fetchAllSurfSpots()) // Dispatch the thunk to fetch surf spots
  }, [dispatch])

  const numCountries = new Set(surfSpots.map((spot) => spot.country)).size
  const numContinents = new Set(surfSpots.map((spot) => spot.continent)).size

  const renderContent = () => {
    if (loading) {
      return <p className="status-message">Loading...</p>
    }

    if (error) {
      return <p className="status-message error">Error: {error}</p>
    }

    if (!surfSpots || surfSpots?.length === 0) {
      return <p className="status-message">No surf spots found</p>
    }

    return (
      <div>
        <div className="row summary">
          <Widget title="Total Spots" value={surfSpots.length} />
          <Widget title="No. Countries" value={numCountries} />
          <Widget title="No. Continents" value={numContinents} />
        </div>
        <SurfSpotList
          {...{
            surfSpots,
            selectedSurfSpot,
            setSelectedSurfSpot,
            navigate,
          }}
        />
      </div>
    )
  }

  return <Page title="Overview" content={renderContent()} />
}

export default Overview
