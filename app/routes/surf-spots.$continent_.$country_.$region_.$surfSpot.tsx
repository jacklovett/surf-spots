import { json, useLoaderData, useNavigate } from '@remix-run/react'

import { get } from '~/services/networkService'
import { SurfSpot } from '~/types/surfSpots'

import {
  Details,
  ErrorBoundary,
  InfoMessage,
  SurfMap,
  SurfSpotActions,
} from '~/components'
import { useUser } from '~/contexts/UserContext'

interface LoaderData {
  surfSpotDetails?: SurfSpot
  error?: string
}

interface LoaderParams {
  surfSpot: string
}

export const loader = async ({ params }: { params: LoaderParams }) => {
  const { surfSpot } = params
  try {
    const surfSpotDetails = await get<SurfSpot>(`surf-spots/${surfSpot}`)
    return json<LoaderData>(
      { surfSpotDetails },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
      },
    )
  } catch (error) {
    console.error('Error fetching surf spot details: ', error)
    return json<LoaderData>(
      {
        error: `We can't seem to locate this surf spot. Please try again later.`,
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        },
      },
    )
  }
}

export default function SurfSpotDetails() {
  const { surfSpotDetails } = useLoaderData<LoaderData>()
  const { user } = useUser()
  const navigate = useNavigate()
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
                <SurfSpotActions
                  {...{ surfSpot: surfSpotDetails, navigate, user }}
                />
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
        <div className="content">
          <InfoMessage message="See something not right? Let us know so we can get it fixed" />
        </div>
      </div>
    )
  }

  return renderContent()
}
