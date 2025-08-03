import {
  ActionFunction,
  data,
  LoaderFunction,
  useFetcher,
  useLoaderData,
  useNavigate,
} from 'react-router'

import { get } from '~/services/networkService'
import { SurfSpot } from '~/types/surfSpots'

import {
  CalendarIcon,
  ContentStatus,
  Details,
  DirectionIcon,
  ErrorBoundary,
  InfoMessage,
  NavButton,
  Rating,
  SurfHeightIcon,
  SurfMap,
  SurfSpotActions,
  TideIcon,
} from '~/components'
import {
  FetcherSubmitParams,
  submitFetcher,
  SurfSpotActionFetcherResponse,
} from '~/components/SurfSpotActions'
import { useUser, useSettings } from '~/contexts'
import { units } from '~/contexts/SettingsContext'
import { surfSpotAction } from '~/services/surfSpot.server'
import { getSession } from '~/services/session.server'
import { metersToFeet } from '~/utils'

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
    return { surfSpotDetails }
  } catch (error) {
    console.error('Error fetching surf spot details: ', error)
    return data<LoaderData>(
      {
        error: `We can't seem to locate this surf spot. Please try again later.`,
      },
      {
        status: 500,
      },
    )
  }
}

const formatSurfHeightRange = (
  preferredUnits: units,
  minSurfHeight?: number,
  maxSurfHeight?: number,
) => {
  if (!minSurfHeight && !maxSurfHeight) {
    return '-'
  }

  const convertHeight = (height: number = 0) =>
    preferredUnits === 'imperial' ? metersToFeet(height) : height

  const min = convertHeight(minSurfHeight)
  const max = maxSurfHeight ? convertHeight(maxSurfHeight) : null

  const unit = preferredUnits === 'imperial' ? 'ft' : 'm'
  const heightRange = max ? `${min}-${max}` : `+${min}`
  return `${heightRange}${unit}`
}

export default function SurfSpotDetails() {
  const { surfSpotDetails } = useLoaderData<LoaderData>()
  const { user } = useUser()
  const { settings } = useSettings()
  const { preferredUnits } = settings
  const navigate = useNavigate()

  const fetcher = useFetcher<SurfSpotActionFetcherResponse>()

  const onFetcherSubmit = (params: FetcherSubmitParams) =>
    submitFetcher(params, fetcher)

  const renderContent = () => {
    if (!surfSpotDetails) {
      return (
        <ContentStatus isError>
          <p>Surf spot details not found.</p>
        </ContentStatus>
      )
    }

    const {
      beachBottomType,
      description,
      name,
      rating,
      skillLevel,
      type,
      tide,
      swellDirection,
      windDirection,
      minSurfHeight,
      maxSurfHeight,
      boatRequired,
      parking,
      foodNearby,
      foodTypes,
      accommodationNearby,
      accommodationTypes,
      hazards,
      facilities,
      forecasts,
    } = surfSpotDetails

    return (
      <div className="column">
        <div className="content">
          <div className="column">
            <div className="row space-between">
              <h1>{name}</h1>
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
              <Details label="Break Type" value={type} />
              <Details label="Beach Bottom" value={beachBottomType} />
              <Details label="Skill Level" value={skillLevel} />
            </div>
          </div>
        </div>
        <ErrorBoundary message="Uh-oh! Something went wrong displaying the map!">
          <div className="mv">
            <SurfMap surfSpots={[surfSpotDetails]} disableInteractions />
          </div>
        </ErrorBoundary>
        <section className="content">
          <h3>Best Conditions</h3>
          <div className="row spot-details gap mb pv">
            <div className="gap center-vertical">
              <DirectionIcon type="swell" directionRange={swellDirection} />
              <Details label="Swell Direction" value={swellDirection} />
            </div>
            <div className="gap center-vertical">
              <DirectionIcon type="wind" directionRange={windDirection} />
              <Details label="Wind Direction" value={windDirection} />
            </div>
            <div className="gap center-vertical">
              <TideIcon tide={tide} />
              <Details label="Tides" value={tide} />
            </div>

            <div className="gap center-vertical">
              <SurfHeightIcon />
              <Details
                label="Surf Height"
                value={formatSurfHeightRange(
                  preferredUnits,
                  minSurfHeight,
                  maxSurfHeight,
                )}
              />
            </div>
            <div className="gap center-vertical">
              <CalendarIcon />
              <Details label="Season" value="Sept - May" />
            </div>
          </div>
        </section>
        <section className="content">
          <h3>Surf Forecasts</h3>
          {forecasts && (
            <>
              <p>
                Looking for real time conditions? Below is a list of forecasts
                to check out
              </p>
              <div className="column mv">
                {/* TODO: add icons/logos for well known forecasting sites */}
                {forecasts.map((forecast) => (
                  <a
                    key={forecast}
                    href={forecast}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {forecast}
                  </a>
                ))}
              </div>
            </>
          )}
          <p>
            Know a reliable forecast for this spot? Let us know and share the
            love!
          </p>
        </section>
        <section className="content">
          <h3>Amenities</h3>
          <div className="row gap mb pv">
            <p className="bold">How to get there?</p>
            <Details
              label="Is a boat required?"
              value={boatRequired ? 'Yes' : 'No'}
            />
            <Details label="Parking" value={parking} />

            {facilities && (
              <div>
                <p className="bold">Facilities:</p>
                <div className="flex column">
                  {facilities.map((facility: string) => (
                    <p>{facility}</p>
                  ))}
                </div>
              </div>
            )}

            {hazards && (
              <div>
                <p className="bold">Hazard:</p>
                <div className="flex column">
                  {hazards.map((hazard: string) => (
                    <p>{hazard}</p>
                  ))}
                </div>
              </div>
            )}

            {accommodationNearby && (
              <div>
                <p className="bold">Accomodation Options:</p>
                <div className="flex column">
                  {accommodationTypes.map((accommodationType: string) => (
                    <p>{accommodationType}</p>
                  ))}
                </div>
              </div>
            )}

            {foodNearby && (
              <div>
                <p className="bold">Food Options:</p>
                <div className="flex column">
                  {foodTypes.map((foodType: string) => (
                    <p>{foodType}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
        <section className="content">
          <b>Overall Rating</b>
          <div className="row gap mb pv">
            <Rating value={rating} readOnly />
          </div>
        </section>
        <div className="content">
          <InfoMessage message="See something not right? Let us know so we can get it fixed" />
        </div>
      </div>
    )
  }

  return renderContent()
}
