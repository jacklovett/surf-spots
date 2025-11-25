import {
  data,
  LoaderFunction,
  useLoaderData,
  useNavigation,
  useNavigate,
} from 'react-router'

import { requireSessionCookie } from '~/services/session.server'

import {
  ContentStatus,
  ErrorBoundary,
  FeedItem,
  TripPlannerButton,
  Loading,
  Page,
  SurfMap,
  SurfSpotList,
} from '~/components'
import { WatchedSurfSpotsSummary } from '~/types/watchedSurfSpotsSummary'
import { cacheControlHeader, get } from '~/services/networkService'
import { useScrollReveal } from '~/hooks'

interface LoaderData {
  watchedSurfSpotsSummary?: WatchedSurfSpotsSummary
  error?: string
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireSessionCookie(request)
  const userId = user?.id

  const cookie = request.headers.get('Cookie') ?? ''

  try {
    const watchedSurfSpotsSummary = await get(`watch/${userId}`, {
      headers: { Cookie: cookie },
    })
    return data<LoaderData>(
      {
        watchedSurfSpotsSummary:
          watchedSurfSpotsSummary as WatchedSurfSpotsSummary,
      },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    return data<LoaderData>(
      {
        error: `We couldn't find the updates on watched surf spots right now. Please try again later.`,
      },
      {
        status: 500,
      },
    )
  }
}

export default function Watchlist() {
  const { state } = useNavigation()
  const navigate = useNavigate()
  const loading = state === 'loading'

  const { watchedSurfSpotsSummary, error } = useLoaderData<LoaderData>()
  const feedRef = useScrollReveal()

  if (error) {
    return (
      <Page showHeader>
        <ContentStatus>
          <p>{error}</p>
        </ContentStatus>
      </Page>
    )
  }

  if (loading) {
    return (
      <Page showHeader>
        <ContentStatus>
          <Loading />
        </ContentStatus>
      </Page>
    )
  }

  const { surfSpots: watchListSpots = [], notifications = [] } =
    watchedSurfSpotsSummary || {}

  const hasNotifications = notifications.length > 0
  const surfSpotsFound = watchListSpots.length > 0

  // Extract surfSpot from each WatchListSpot (backend returns wrapped objects)
  const surfSpots = watchListSpots?.map((item) => item.surfSpot)

  return (
    <Page showHeader>
      <TripPlannerButton onOpenTripPlanner={() => navigate('/trip-planner')} />
      <div className="info-page-content mv map-content">
        <h1>Watch List</h1>
        <div className="watchlist-header-actions">
          <a href="#watchlist-map" className="watchlist-spots-link">
            {surfSpotsFound
              ? `View Your Watched Spots (${surfSpots.length}) →`
              : 'View Your Watched Spots →'}
          </a>
        </div>
        <p>
          Here, we keep you updated on swell seasons, local news, events, and
          travel deals for all the surf spots you're interested in. Use these
          updates to help plan your next surf trip
        </p>
        <ErrorBoundary message="Uh-oh! Something went wrong displaying the latest updates">
          {!hasNotifications && (
            <div className="watchlist-empty-state">
              <p className="mv-l">
                No updates found for your watched surf spots
              </p>
              <p className="text-secondary">
                Add surf spots to your watch list to receive updates about
                events, swell seasons, deals, and more!
              </p>
            </div>
          )}
          {hasNotifications && (
            <div className="watchlist-feed">
              <h2 className="feed-section-title">Latest Updates</h2>
              <div ref={feedRef} className="feed-container">
                {notifications.map((notification) => (
                  <FeedItem key={notification.id} notification={notification} />
                ))}
              </div>
            </div>
          )}
        </ErrorBoundary>
        <div id="watchlist-map" className="map-wrapper center">
          <ErrorBoundary message="Uh-oh! Something went wrong displaying the map!">
            <SurfMap surfSpots={surfSpots} />
          </ErrorBoundary>
        </div>
        <div id="watched-spots">
          <ErrorBoundary message="Unable to load surf spot list">
            {!surfSpotsFound && (
              <p className="mv-l">
                No watched surf spots found. Add some spots to your watch list
                so you can stay up to date.
              </p>
            )}
            {surfSpotsFound && (
              <>
                <h2 className="watched-spots-title">Your Watched Surf Spots</h2>
                <SurfSpotList surfSpots={surfSpots} />
              </>
            )}
          </ErrorBoundary>
        </div>
      </div>
    </Page>
  )
}
