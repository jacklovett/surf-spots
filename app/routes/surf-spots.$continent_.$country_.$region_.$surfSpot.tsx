import { json, useLoaderData, useNavigate } from '@remix-run/react'
import { TextButton } from '~/components'
import { deleteData, get, post } from '~/services/networkService'
import { SurfSpot } from '~/types/surfSpots'

interface LoaderData {
  surfSpotDetails?: SurfSpot
}

interface LoaderParams {
  surfSpot: string
}

export const loader = async ({ params }: { params: LoaderParams }) => {
  const { surfSpot } = params
  const surfSpotDetails = await get<SurfSpot>(`surf-spots/${surfSpot}`)
  return json<LoaderData>({ surfSpotDetails })
}

export default function SurfSpotDetails() {
  const { surfSpotDetails } = useLoaderData<LoaderData>()
  console.log(surfSpotDetails)
  const isSurfedSpot = false // where do we get this from?
  const isWishlisted = false
  const navigate = useNavigate()

  const renderContent = () => {
    if (!surfSpotDetails) {
      return (
        <div className="column center">
          <p>Surf spot details not found.</p>
        </div>
      )
    }

    const { id, beachBottomType, description, name, rating, skillLevel, type } =
      surfSpotDetails

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
      <section>
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
        <div className="column content-container">
          <div>
            <h3>{name}</h3>
            <p>{description}</p>
          </div>
          <div className="details">
            <p>Break Type:</p>
            <p>{type}</p>
          </div>
          <div className="details">
            <p>Beach Bottom:</p>
            <p>{beachBottomType}</p>
          </div>
          <div className="details">
            <p>Skill Level:</p>
            <p>{skillLevel}</p>
          </div>
          <div className="details">
            <p>Rating:</p>
            <p>{rating}</p>
          </div>
        </div>
      </section>
    )
  }

  return renderContent()
}
