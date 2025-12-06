import { RefObject } from 'react'
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
  EmptyState,
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
  const emptyStateRef = useScrollReveal()

  if (error) {
    return (
      <Page showHeader>
        <ContentStatus>
          <p>{error}</p>
        </ContentStatus>
      </Page>
    )
  }

  // Don't render until we have data
  if (loading || !watchedSurfSpotsSummary) {
    return (
      <Page showHeader>
        <ContentStatus>
          <Loading />
        </ContentStatus>
      </Page>
    )
  }

  const { surfSpots: watchListSpots = [], notifications = [] } =
    watchedSurfSpotsSummary

  const hasNotifications = notifications.length > 0
  const surfSpotsFound = watchListSpots.length > 0

  // Extract surfSpot from each WatchListSpot - backend should already set flags
  const surfSpots = watchListSpots?.map((item) => item.surfSpot)

  return (
    <Page showHeader>
      <TripPlannerButton onOpenTripPlanner={() => navigate('/trip-planner')} />
      <div className="info-page-content mv map-content">
        <h1>Watch List</h1>
        {surfSpotsFound && (
          <div className="watchlist-header-actions">
            <a href="#watched-spots" className="watchlist-spots-link">
              View Your Watched Spots ({surfSpots.length}) →
            </a>
          </div>
        )}
        {surfSpotsFound ? (
          <>
            <p>
              Stay updated on swell seasons, local news, events, and travel deals 
              for the spots you're following.
            </p>
            
            <ErrorBoundary message="Uh-oh! Something went wrong displaying the latest updates">
              {hasNotifications ? (
                <div className="watchlist-feed">
                  <h2 className="feed-section-title">Latest Updates</h2>
                  <div ref={feedRef} className="feed-container">
                    {notifications.map((notification) => (
                      <FeedItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-secondary mt-l">
                  No updates yet. We'll notify you when there's news about your watched spots.
                </p>
              )}
            </ErrorBoundary>

            <div id="watchlist-map" className="map-wrapper center mt-l">
              <ErrorBoundary message="Uh-oh! Something went wrong displaying the map!">
                <SurfMap surfSpots={surfSpots} />
              </ErrorBoundary>
            </div>

            <div id="watched-spots" className="mt-l">
              <h2 className="watched-spots-title">Your Watched Surf Spots</h2>
              <ErrorBoundary message="Unable to load surf spot list">
                <SurfSpotList surfSpots={surfSpots} />
              </ErrorBoundary>
            </div>
          </>
        ) : (
          <div ref={emptyStateRef as RefObject<HTMLDivElement>}>
            <div className="mt-l animate-on-scroll">
              <EmptyState
                title="Build Your Watch List"
                description="Follow surf spots you're interested in to get alerts about swell seasons, events, and travel deals. Use the map below to find spots to watch."
                ctaText="Explore Surf Spots"
                ctaHref="/surf-spots"
              />
            </div>
          </div>
        )}
      </div>
    </Page>
  )
}
