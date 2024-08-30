import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllSurfSpots, selectSurfSpotsState } from '../Store/surfSpots'

import { SurfSpot } from '../Controllers/surfSpotController'
import { ErrorBoundary, Page, SurfSpotList, Widget } from '../Components'
import { AppDispatch } from '../Store'

const MySurfSpots = () => {
  const dispatch: AppDispatch = useDispatch()
  const navigate = useNavigate()

  const { data: surfSpots, error, loading } = useSelector(selectSurfSpotsState)
  const [selectedSurfSpot, setSelectedSurfSpot] = useState<SurfSpot | null>(
    null,
  )

  useEffect(() => {
    dispatch(fetchAllSurfSpots()) // Dispatch the thunk to fetch surf spots
  }, [dispatch])

  const numCountries = new Set(surfSpots?.map((spot) => spot.country)).size
  const numContinents = new Set(surfSpots?.map((spot) => spot.continent)).size

  const renderContent = () => {
    if (!surfSpots?.length) {
      return (
        <div className="column center">
          <p>No surf spots found</p>
        </div>
      )
    }

    return (
      <div>
        <div className="row summary">
          <ErrorBoundary>
            <Widget title="Total Spots" value={surfSpots.length} />
            <Widget title="No. Countries" value={numCountries} />
            <Widget title="No. Continents" value={numContinents} />
          </ErrorBoundary>
        </div>
        <ErrorBoundary message="Unable to load surf spot list">
          <SurfSpotList
            {...{
              surfSpots,
              selectedSurfSpot,
              setSelectedSurfSpot,
              navigate,
            }}
          />
        </ErrorBoundary>
      </div>
    )
  }

  return (
    <Page
      showHeader
      content={renderContent()}
      loading={loading}
      error={error}
    />
  )
}

export default MySurfSpots
