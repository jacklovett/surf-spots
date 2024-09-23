import { useNavigate, useParams } from '@remix-run/react'
import { Button, TextButton } from '~/components'
import { SurfSpotType } from '~/types/surfSpots'

export default function SurfSpot() {
  const { continent, country, region, surfSpotId } = useParams()
  const id = surfSpotId

  const isSurfedSpot = true // where do we get this from?
  const loading = false
  const error = null

  const surfSpot = {
    id,
    name: 'Luz',
    description: 'Nice sandy beach, popular with beginners. Avoid at low tide.',
    continent,
    country,
    region,
    rating: 4,
    type: SurfSpotType.BeachBreak,
  }

  const navigate = useNavigate()

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
          {!isSurfedSpot && (
            <>
              <TextButton
                text="Add to Wishlist"
                onClick={() => navigate('/surf-spots')}
                iconKey="heart"
              />
              <TextButton
                text="Add to surfed spots"
                onClick={() => navigate('/surf-spots')}
                iconKey="plus"
              />
            </>
          )}
          {isSurfedSpot && (
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
            <Button label="Back" onClick={() => navigate(-1)} />
          </div>
        </div>
      </div>
    )
  }

  return renderContent()
}
