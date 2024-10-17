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

    const { beachBottomType, description, name, rating, skillLevel, type } =
      surfSpotDetails

    return (
      <div className="column">
        <div className="content">
          <div className="column">
            <div className="row space-between">
              <h3>{name}</h3>
              <div className="spot-actions">
                <SurfSpotActions {...{ surfSpot: surfSpotDetails }} />
              </div>
            </div>
            <p className="description">{description}</p>
            <div className="row spot-details mb">
              <Details label="Break Type" value={type} />
              <Details label="Beach Bottom" value={beachBottomType} />
              <Details label="Skill Level" value={skillLevel} />
              <Details label="Rating" value={rating ? `${rating}/ 5` : 'N/A'} />
            </div>
          </div>
        </div>
        <ErrorBoundary message="Uh-oh! Something went wrong displaying the map!">
          <div className="mv">
            <SurfMap surfSpots={[surfSpotDetails]} disableInteractions />
          </div>
        </ErrorBoundary>
      </div>
    )
  }

  return renderContent()
}
