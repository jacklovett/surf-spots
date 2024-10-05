import { json, useLoaderData, useNavigate } from '@remix-run/react'
import { Button, TextButton } from '~/components'
import { deleteData, get, post } from '~/services/networkService'
import { SurfSpot } from '~/types/surfSpots'

interface LoaderData {
  surfSpot?: SurfSpot
}

export const loader = async (params: { slug: string }) => {
  const { slug } = params
  const surfSpot = await get<SurfSpot>(`surf-spots/${slug}`)
  return json<LoaderData>({ surfSpot })
}

export default function SurfSpotDetails() {
  const { surfSpot } = useLoaderData<LoaderData>()

  const isSurfedSpot = true // where do we get this from?
  const isWishlisted = true
  const navigate = useNavigate()

  const renderContent = () => {
    if (!surfSpot) {
      return (
        <div className="column center">
          <p>Surf spot details not found.</p>
        </div>
      )
    }

    const { id, continent, country, description, name, rating, region, type } =
      surfSpot

    const userSpotRequest = {
      userId: 1, // TODO: get from state!!
      surfSpotId: id,
    }

    const addToSurfedSpots = async () => {
      await post('user-spots', userSpotRequest)
      navigate('/surfed-spots')
    }

    const addToWishlist = async () => {
      await post('wishlist', userSpotRequest)
      navigate('/wishlist')
    }

    const removeFromSurfedSpot = async () => {
      const { userId, surfSpotId } = userSpotRequest
      await deleteData(`user-spots/${userId}/remove/${surfSpotId}`)
      navigate('/surfed-spots')
    }

    const removeFromWishlist = async () => {
      const { userId, surfSpotId } = userSpotRequest
      await deleteData(`wishlist/${userId}/remove/${surfSpotId}`)
      navigate('/wishlist')
    }

    return (
      <div>
        <div className="actions">
          {!isSurfedSpot && (
            <>
              <TextButton
                text="Add to Wishlist"
                onClick={addToWishlist}
                iconKey="heart"
              />
              <TextButton
                text="Add to surfed spots"
                onClick={addToSurfedSpots}
                iconKey="plus"
              />
            </>
          )}
          {isSurfedSpot && (
            <TextButton
              text="Remove from surfed spots"
              onClick={removeFromSurfedSpot}
              iconKey="bin"
            />
          )}
          {isWishlisted && (
            <TextButton
              text="Remove from wishlist"
              onClick={removeFromWishlist}
              iconKey="bin" // TODO: heart break icon ??
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
