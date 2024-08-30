import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { fetchAllSurfSpots, selectSurfSpotsState } from '../Store/surfSpots'

import { ErrorBoundary, Page, SurfSpotList } from '../Components'
import { AppDispatch } from '../Store'

const SurfSpots = () => {
  const dispatch: AppDispatch = useDispatch()
  const navigate = useNavigate()

  const { data: surfSpots, error, loading } = useSelector(selectSurfSpotsState)

  useEffect(() => {
    dispatch(fetchAllSurfSpots()) // Dispatch the thunk to fetch surf spots
  }, [dispatch])

  const renderStatusMessage = (message: string, isError = false) => (
    <div className="center column">
      <p className={`status-message ${isError ? 'error' : ''}`}>{message}</p>
    </div>
  )

  const renderContent = () => {
    if (loading) return renderStatusMessage('Loading...')
    if (error) return renderStatusMessage(`Error: ${error}`, true)
    if (!surfSpots?.length) return renderStatusMessage('No surf spots found')

    return (
      <div>
        <ErrorBoundary message="Unable to load surf spot list">
          <SurfSpotList
            {...{
              surfSpots,
              navigate,
            }}
          />
        </ErrorBoundary>
      </div>
    )
  }

  return <Page showHeader content={renderContent()} />
}

export default SurfSpots
