import {
  ActionFunction,
  data,
  LoaderFunction,
  useFetcher,
  useLoaderData,
  useNavigate,
} from 'react-router'

import { cacheControlHeader, get } from '~/services/networkService'
import { SurfSpot } from '~/types/surfSpots'

import {
  CalendarIcon,
  ContentStatus,
  Details,
  DirectionIcon,
  ErrorBoundary,
  InfoMessage,
  Rating,
  SurfHeightIcon,
  SurfMap,
  SurfSpotActions,
  TideIcon,
} from '~/components'
import { submitFetcher } from '~/components/SurfSpotActions'
import { FetcherSubmitParams } from '~/components/SurfSpotActions'

import { useUserContext, useSettingsContext } from '~/contexts'
import { units } from '~/contexts/SettingsContext'

import { surfSpotAction } from '~/services/surfSpot.server'
import { getSession } from '~/services/session.server'
import { formatSurfHeightRange, formatSeason } from '~/utils/surfSpotUtils'

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
    return data<LoaderData>(
      { surfSpotDetails },
      {
        headers: cacheControlHeader,
      },
    )
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

export default function SurfSpotDetails() {
  const { surfSpotDetails, error } = useLoaderData<LoaderData>()
  const { user } = useUserContext()
  const { settings } = useSettingsContext()
  const { preferredUnits } = settings
  const navigate = useNavigate()

  const fetcher = useFetcher<string>()

  const onFetcherSubmit = (params: FetcherSubmitParams) =>
    submitFetcher(params, fetcher)

  if (error || !surfSpotDetails) {
    return (
      <ContentStatus isError>
        <p>{error ?? 'Surf spot details not found.'}</p>
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
    seasonStart,
    seasonEnd,
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
    <div className="mb-l">
      <div className="content column">
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
      <ErrorBoundary message="Uh-oh! Something went wrong displaying the map!">
        <div className="map-wrapper mv">
          <SurfMap surfSpots={[surfSpotDetails]} disableInteractions />
        </div>
      </ErrorBoundary>
      <div className="content pt">
        <section>
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
              <Details
                label="Season"
                value={formatSeason(seasonStart, seasonEnd)}
              />
            </div>
          </div>
        </section>
        <section>
          <h3>Surf Forecasts</h3>
          {forecasts && forecasts.length > 0 ? (
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
          ) : (
            <p>
              Know a reliable forecast for this spot? Let us know and share the
              love!
            </p>
          )}
        </section>
        <section>
          <h3>Amenities</h3>
          <div className="amenities-content">
            <div className="amenities-section">
              <h4>How to get there?</h4>
              <div className="amenities-details">
                <Details
                  label="Is a boat required?"
                  value={boatRequired ? 'Yes' : 'No'}
                />
                <Details label="Parking" value={parking} />
              </div>
            </div>

            <div className="amenities-section">
              <h4>Facilities</h4>
              <div className="amenities-list">
                {facilities && facilities.length > 0 ? (
                  facilities.map((facility: string) => (
                    <span key={facility} className="amenities-item">
                      {facility}
                    </span>
                  ))
                ) : (
                  <span className="amenities-item empty">
                    No facilities listed
                  </span>
                )}
              </div>
            </div>

            {accommodationNearby &&
              accommodationTypes &&
              accommodationTypes.length > 0 && (
                <div className="amenities-section">
                  <h4>Accommodation Options</h4>
                  <div className="amenities-list">
                    {accommodationTypes.map((accommodationType: string) => (
                      <span key={accommodationType} className="amenities-item">
                        {accommodationType}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {foodNearby && foodTypes && foodTypes.length > 0 && (
              <div className="amenities-section">
                <h4>Food Options</h4>
                <div className="amenities-list">
                  {foodTypes.map((foodType: string) => (
                    <span key={foodType} className="amenities-item">
                      {foodType}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
        <section>
          <h3>Hazards</h3>
          <div className="amenities-content">
            <div className="amenities-section">
              <div className="amenities-list">
                {hazards && hazards.length > 0 ? (
                  hazards.map((hazard: string) => (
                    <span key={hazard} className="amenities-item">
                      {hazard}
                    </span>
                  ))
                ) : (
                  <span className="amenities-item empty">
                    No hazards listed
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
        <section>
          <b>Overall Rating</b>
          <div className="row gap pt">
            <Rating value={rating} readOnly />
          </div>
        </section>
        <InfoMessage message="See something not right? Let us know so we can get it fixed" />
      </div>
    </div>
  )
}
