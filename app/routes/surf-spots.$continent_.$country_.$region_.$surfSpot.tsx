import { json, useFetcher, useLoaderData, useNavigate } from '@remix-run/react'

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
import { ActionFunction, LoaderFunction } from '@remix-run/node'
import { surfSpotAction } from '~/services/surfSpot.server'
import { getSession } from '~/services/session.server'
import {
  FetcherSubmitParams,
  submitFetcher,
  SurfSpotActionFetcherResponse,
} from '~/components/SurfSpotActions'

interface LoaderData {
  surfSpotDetails?: SurfSpot
  error?: string
}

export const action: ActionFunction = surfSpotAction

export const loader: LoaderFunction = async ({ request, params }) => {
  const { surfSpot } = params
  try {
    const session = await getSession(request.headers.get('Cookie'))
    const user = session.get('user')
    const userId = user?.id

    // Build API URL with optional userId
    const url = userId
      ? `surf-spots/${surfSpot}?userId=${userId}`
      : `surf-spots/${surfSpot}`

    const surfSpotDetails = await get<SurfSpot>(url)
    return json<LoaderData>({ surfSpotDetails })
  } catch (error) {
    console.error('Error fetching surf spot details: ', error)
    return json<LoaderData>(
      {
        error: `We can't seem to locate this surf spot. Please try again later.`,
      },
      {
        status: 500,
      },
    )
  }
}

export default function SurfSpotDetails() {
  const { surfSpotDetails } = useLoaderData<LoaderData>()
  const { user } = useUser()
  const navigate = useNavigate()

  const fetcher = useFetcher<SurfSpotActionFetcherResponse>()

  const onFetcherSubmit = (params: FetcherSubmitParams) =>
    submitFetcher(params, fetcher)

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
                  {...{
                    surfSpot: surfSpotDetails,
                    navigate,
                    user,
                    onFetcherSubmit,
                  }}
                />
              </div>
            </div>
            <p className="description">{description}</p>
            <div className="row spot-details gap mb pv">
              <Details label="🏄‍♂️ Break Type" value={type} />
              <Details label="🏖️ Beach Bottom" value={beachBottomType} />
              <Details label="🎯 Skill Level" value={skillLevel} />
              <Details
                label="⭐ Rating"
                value={rating ? `${rating}/ 5` : 'N/A'}
              />
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
