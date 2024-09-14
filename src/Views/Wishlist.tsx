import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { ContentStatus, ErrorBoundary, Page, SurfSpotList } from '../Components'
import { fetchAllSurfSpots } from '../Services/surfSpotService'
import { AppDispatch } from '../Store'
import {
  selectSurfSpotsLoading,
  selectSurfSpots,
  selectSurfSpotsError,
} from '../Store/surfSpots'

const WishList = () => {
  const dispatch: AppDispatch = useDispatch()
  const navigate = useNavigate()

  const surfSpots = useSelector(selectSurfSpots)
  const error = useSelector(selectSurfSpotsError)
  const loading = useSelector(selectSurfSpotsLoading)

  useEffect(() => {
    dispatch(fetchAllSurfSpots())
  }, [dispatch])

  const surfSpotsFound = surfSpots?.length > 0

  return (
    <Page
      showHeader
      content={
        <div className="column center">
          <p>WIP: WishList page</p>
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
      }
      loading={loading}
      error={error}
    />
  )
}

export default WishList
