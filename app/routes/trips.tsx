import { RefObject } from 'react'
import {
  data,
  LoaderFunction,
  useLoaderData,
  useNavigate,
  useNavigation,
} from 'react-router'
import { Page, TextButton, ContentStatus } from '~/components'
import { requireSessionCookie } from '~/services/session.server'
import { cacheControlHeader, get } from '~/services/networkService'
import { Trip } from '~/types/trip'
import { useScrollReveal } from '~/hooks'

interface LoaderData {
  trips: Trip[]
  error?: string
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireSessionCookie(request)
  const userId = user?.id

  const cookie = request.headers.get('Cookie') ?? ''

  try {
    const trips = await get<Trip[]>(`trips/mine?userId=${userId}`, {
      headers: { Cookie: cookie },
    })
    return data<LoaderData>(
      { trips },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    console.error('Error fetching trips:', error)
    return data<LoaderData>(
      {
        error: `We couldn't load your trips right now. Please try again later.`,
        trips: [],
      },
      { status: 500 },
    )
  }
}

export default function Trips() {
  const navigate = useNavigate()
  const navigation = useNavigation()
  const { state } = navigation

  // Get loader data - must be called before any conditional returns
  const loaderData = useLoaderData<LoaderData>()
  const { trips, error } = loaderData || {}

  // Hooks to animate cards when they scroll into view - must be called before any conditional returns
  const ownedTripsRef = useScrollReveal()
  const memberTripsRef = useScrollReveal()

  // Show loading state only if we don't have data yet
  // Don't show loading during navigation if we already have data
  const isLoading = (!loaderData || trips === undefined) && state === 'loading'

  const handleCreateTrip = () => navigate('/add-trip')
  const handleTripClick = (tripId: string) => navigate(`/trip/${tripId}`)

  if (error) {
    return (
      <Page showHeader>
        <ContentStatus isError>
          <p>{error}</p>
        </ContentStatus>
      </Page>
    )
  }

  // Ensure trips is defined (should always be an array from loader)
  const tripsList = trips || []
  const ownedTrips = tripsList.filter((trip) => trip.isOwner)
  const memberTrips = tripsList.filter((trip) => !trip.isOwner)

  return (
    <Page showHeader>
      <div className="info-page-content mv">
        <div className="trips-header">
          <h1>My Trips</h1>
          <TextButton
            text="Create Trip"
            onClick={handleCreateTrip}
            iconKey="plus"
            filled
          />
        </div>

        {tripsList.length === 0 ? (
          <div className="trips-empty">
            <p className="mv-l">No trips yet</p>
            <p className="text-secondary">
              Create your first trip to start planning your surf adventures
            </p>
          </div>
        ) : (
          <>
            {ownedTrips.length > 0 && (
              <div className="trips-section">
                <div
                  ref={ownedTripsRef as RefObject<HTMLDivElement>}
                  className="trips-grid"
                >
                  {ownedTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="trip-card animate-on-scroll"
                      onClick={() => handleTripClick(trip.id)}
                    >
                      <h3>{trip.title}</h3>
                      {trip.startDate && trip.endDate && (
                        <p className="trip-dates">
                          {new Date(trip.startDate).toLocaleDateString()} -{' '}
                          {new Date(trip.endDate).toLocaleDateString()}
                        </p>
                      )}
                      {trip.description && <p>{trip.description}</p>}
                      {trip.spots && trip.spots.length > 0 && (
                        <p className="trip-spots">
                          {trip.spots.length} spot
                          {trip.spots.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {memberTrips.length > 0 && (
              <div className="trips-section">
                <h2>Trips I'm Invited To</h2>
                <div
                  ref={memberTripsRef as RefObject<HTMLDivElement>}
                  className="trips-grid"
                >
                  {memberTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="trip-card animate-on-scroll"
                      onClick={() => handleTripClick(trip.id)}
                    >
                      <h3>{trip.title}</h3>
                      <p className="trip-owner">by {trip.ownerName}</p>
                      {trip.startDate && trip.endDate && (
                        <p className="trip-dates">
                          {new Date(trip.startDate).toLocaleDateString()} -{' '}
                          {new Date(trip.endDate).toLocaleDateString()}
                        </p>
                      )}
                      {trip.description && <p>{trip.description}</p>}
                      {trip.spots && trip.spots.length > 0 && (
                        <p className="trip-spots">
                          {trip.spots.length} spot
                          {trip.spots.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Page>
  )
}
