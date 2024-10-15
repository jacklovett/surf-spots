import { json, useLoaderData } from '@remix-run/react'
import { get } from '~/services/networkService'
import { SurfSpot } from '~/types/surfSpots'
import { Details, ErrorBoundary, SurfMap } from '~/components'
import SurfSpotActions from '~/components/SurfSpotActions'

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
  const isSurfedSpot = false // TODO: get from state!!
  const isWishlisted = false

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

    return (
      <div className="column">
        <div className="content">
          <SurfSpotActions
            {...{ surfSpotId: id, isSurfedSpot, isWishlisted }}
          />
          <div className="column">
            <div>
              <h3>{name}</h3>
              <p>{description}</p>
            </div>
            <div className="row spot-details">
              <Details label="Break Type" value={type} />
              <Details label="Beach Bottom" value={beachBottomType} />
              <Details label="Skill Level" value={skillLevel} />
              <Details label="Rating" value={rating ? `${rating}/ 5` : 'N/A'} />
            </div>
          </div>
        </div>
        <ErrorBoundary message="Uh-oh! Something went wrong displaying the map!">
          <SurfMap surfSpots={[surfSpotDetails]} disableInteractions />
        </ErrorBoundary>
      </div>
    )
  }

  return renderContent()
}
