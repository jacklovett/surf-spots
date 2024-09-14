import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectSurfSpots,
  selectSurfSpotsError,
  selectSurfSpotsLoading,
} from '../Store/surfSpots'

import {
  ContentStatus,
  ErrorBoundary,
  Page,
  SurfSpotList,
  Widget,
} from '../Components'
import { AppDispatch } from '../Store'
import { fetchAllSurfSpots } from '../Services/surfSpotService'

const MySurfSpots = () => {
  const dispatch: AppDispatch = useDispatch()
  const navigate = useNavigate()

  const surfSpots = useSelector(selectSurfSpots)
  const error = useSelector(selectSurfSpotsError)
  const loading = useSelector(selectSurfSpotsLoading)

  useEffect(() => {
    dispatch(fetchAllSurfSpots())
  }, [dispatch])

  const renderContent = () => {
    const surfSpotsFound = surfSpots?.length > 0

    const totalSurfedSpots = surfSpots?.length ?? 0
    let numContinents = 0
    let numCountries = 0

    if (surfSpotsFound) {
      numContinents = new Set(surfSpots.map((spot) => spot.continent)).size
      numCountries = new Set(surfSpots.map((spot) => spot.country)).size
    }

    return (
      <div className="column center">
        <div className="row summary">
          <ErrorBoundary>
            <Widget title="Total Spots" value={totalSurfedSpots} />
            <Widget title="No. Countries" value={numCountries} />
            <Widget title="No. Continents" value={numContinents} />
          </ErrorBoundary>
        </div>
        <ErrorBoundary message="Unable to load surf spot list">
          <div className="column center">
            {!surfSpotsFound && <ContentStatus content="No surf spots found" />}
            {surfSpotsFound && (
              <SurfSpotList
                {...{
                  surfSpots,
                  navigate,
                }}
              />
            )}
          </div>
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
