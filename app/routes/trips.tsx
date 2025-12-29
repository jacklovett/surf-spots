import { RefObject } from 'react'
import {
  data,
  LoaderFunction,
  ActionFunction,
  useLoaderData,
  useNavigate
} from 'react-router'
import { Page, TextButton, ContentStatus, Card } from '~/components'
import { requireSessionCookie } from '~/services/session.server'
import { cacheControlHeader, get} from '~/services/networkService'
import { Trip } from '~/types/trip'
import { useScrollReveal } from '~/hooks'
import { formatDate } from '~/utils/dateUtils'
import { ActionData } from '~/types/api'

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

import { ActionData } from '~/types/api'

export const action: ActionFunction = async ({ request }) => {
  const user = await requireSessionCookie(request)
  if (!user?.id) {
    return data<ActionData>(
      { error: 'You must be logged in' },
      { status: 401 },
    )
  }

  // Trip spot actions (add-spot, remove-spot) are handled by surfSpotAction
  // to avoid duplication. They go through the surf spot route action when
  // called from TripSelectionModal via onFetcherSubmit.
  return data<ActionData>({ error: 'Invalid intent' }, { status: 400 })
}

export default function Trips() {
  const navigate = useNavigate()

  // Get loader data - must be called before any conditional returns
  const loaderData = useLoaderData<LoaderData>()
  const { trips, error } = loaderData || {}

  // Hooks to animate cards when they scroll into view - must be called before any conditional returns
  const ownedTripsRef = useScrollReveal()
  const memberTripsRef = useScrollReveal()

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
        <div className="row space-between mb">
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
            <p className="mv bold">No trips yet</p>
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
                  {ownedTrips.map((trip) => {
                    const firstImage = trip.media?.find(
                      (m) => m.mediaType === 'image',
                    )
                    return (
                      <Card
                        key={trip.id}
                        title={trip.title}
                        imageUrl={firstImage?.url}
                        imageAlt={trip.title}
                        onClick={() => handleTripClick(trip.id)}
                      >
                        {trip.startDate && trip.endDate && (
                          <p className="trip-dates">
                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                          </p>
                        )}
                        {trip.description && <p>{trip.description}</p>}
                        {trip.spots && trip.spots.length > 0 && (
                          <p className="trip-spots">
                            {trip.spots.length} spot
                            {trip.spots.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </Card>
                    )
                  })}
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
                  {memberTrips.map((trip) => {
                    const firstImage = trip.media?.find(
                      (m) => m.mediaType === 'image',
                    )
                    return (
                      <Card
                        key={trip.id}
                        title={trip.title}
                        imageUrl={firstImage?.url}
                        imageAlt={trip.title}
                        onClick={() => handleTripClick(trip.id)}
                      >
                        <p className="trip-owner">by {trip.ownerName}</p>
                        {trip.startDate && trip.endDate && (
                          <p className="trip-dates">
                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                          </p>
                        )}
                        {trip.description && <p>{trip.description}</p>}
                        {trip.spots && trip.spots.length > 0 && (
                          <p className="trip-spots">
                            {trip.spots.length} spot
                            {trip.spots.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Page>
  )
}
