import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'

import { Button, Page, TextButton } from '../Components'
import { AppDispatch } from '../Store'
import {
  selectSurfSpotById,
  selectSurfSpotsLoading,
  selectSurfSpotsError,
  fetchSurfSpotById,
} from '../Store/surfSpots'

const SurfSpotDetails = () => {
  const { id } = useParams<{ id?: string }>()
  const dispatch: AppDispatch = useDispatch()
  const navigate = useNavigate()

  // Use the selector for fetching surf spot by ID
  const surfSpot = useSelector(selectSurfSpotById(id || ''))
  const loading = useSelector(selectSurfSpotsLoading)
  const error = useSelector(selectSurfSpotsError)

  const isSurfedSpot = true // TODO: GET FROM REDUX

  useEffect(() => {
    if (id && !surfSpot) {
      dispatch(fetchSurfSpotById(id)).unwrap().catch(console.error)
    }
  }, [id, surfSpot, dispatch])

  const renderContent = () => {
    if (!surfSpot) {
      return (
        <div className="column center">
          <p>Surf spot details not found.</p>
        </div>
      )
    }

    const { continent, country, description, name, rating, region, type } =
      surfSpot

    return (
      <div>
        <div className="actions">
          <TextButton
            text="Add to Wishlist"
            onClick={() => navigate('/surf-spots')}
            iconKey="heart"
          />
          {isSurfedSpot && (
            <TextButton
              text="Add to surfed spots"
              onClick={() => navigate('/surf-spots')}
              iconKey="plus"
            />
          )}
          {!isSurfedSpot && (
            <TextButton
              text="Remove from surfed spots"
              onClick={() => navigate('/surf-spots')}
              iconKey="bin"
            />
          )}
        </div>
        <div className="content-container">
          <div>
            <h3>{name}</h3>
            <p>Description:</p>
            <p>{description}</p>
          </div>
          <div className="details">
            <p>Region:</p>
            <p>{region}</p>
          </div>
          <div className="details">
            <p>Country:</p>
            <p>{country}</p>
          </div>
          <div className="details">
            <p>Continent:</p>
            <p>{continent}</p>
          </div>
          <div className="details">
            <p>Type:</p>
            <p>{type}</p>
          </div>
          <div className="details">
            <p>Rating:</p>
            <p>{rating}</p>
          </div>
          <div className="center">
            <Button label="Back" onClick={() => navigate('/surf-spots')} />
          </div>
        </div>
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

export default SurfSpotDetails
