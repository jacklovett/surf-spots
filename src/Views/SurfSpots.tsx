import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch } from '../Store'
import { fetchAllSurfSpots } from '../Services/surfSpotService'
import {
  selectSurfSpots,
  selectSurfSpotsError,
  selectSurfSpotsLoading,
} from '../Store/surfSpots'

import {
  Button,
  ContentStatus,
  ErrorBoundary,
  Page,
  SurfSpotList,
} from '../Components'

const SurfSpots = () => {
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

    return (
      <div className="column">
        <div className="actions">
          <Button
            onClick={() => navigate('/add-surf-spot')}
            label="Create new spot"
          />
        </div>
        <ErrorBoundary message="Unable to load surf spot list">
          {!surfSpotsFound && <ContentStatus content="No surf spots found" />}
          {surfSpotsFound && (
            <SurfSpotList
              {...{
                surfSpots,
                navigate,
              }}
            />
          )}
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

export default SurfSpots
