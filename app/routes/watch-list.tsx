import { RefObject } from 'react'
import {
  data,
  ActionFunction,
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
import {
  ERROR_BOUNDARY_MAP,
  ERROR_BOUNDARY_SECTION,
  ERROR_BOUNDARY_SURF_SPOT_LIST,
  ERROR_LOAD_WATCH_LIST,
} from '~/utils/errorUtils'
import { WatchedSurfSpotsSummary } from '~/types/watchedSurfSpotsSummary'
import { cacheControlHeader, get, isNetworkError } from '~/services/networkService'
import { useScrollReveal, useSurfSpotActions } from '~/hooks'
import { surfSpotAction } from '~/services/surfSpot.server'

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
    const status = isNetworkError(error) ? error.status : undefined
    console.error('Watch list loader: watch summary fetch failed', {
      status,
      responseSummary: isNetworkError(error) ? error.responseSummary : undefined,
      message: error instanceof Error ? error.message : String(error),
    })

    return data<LoaderData>(
      { error: ERROR_LOAD_WATCH_LIST },
      {
        status: status && status >= 400 && status < 600 ? status : 500,
      },
    )
  }
}

export const action: ActionFunction = surfSpotAction

export default function Watchlist() {
  const navigation = useNavigation()
  const navigate = useNavigate()
  const loading = navigation.state === 'loading'
  const navigatingTo = navigation.location?.pathname

  const { watchedSurfSpotsSummary, error } = useLoaderData<LoaderData>()
  const { onFetcherSubmit } = useSurfSpotActions()
  const feedRef = useScrollReveal()
  const emptyStateRef = useScrollReveal()

  if (error) {
    return (
      <Page showHeader>
        <ContentStatus isError>
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
      <TripPlannerButton onOpenTripPlanner={() => navigate('/trip-planner')} isLoading={loading && navigatingTo === '/trip-planner'} />
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
              Stay updated on swell seasons, local news, events, and travel
              deals for the spots you're following.
            </p>

            <ErrorBoundary message={ERROR_BOUNDARY_SECTION}>
              {hasNotifications ? (
                <div className="watchlist-feed">
                  <h2 className="feed-section-title">Latest Updates</h2>
                  <div ref={feedRef} className="feed-container">
                    {notifications.map((notification) => (
                      <FeedItem
                        key={notification.id}
                        notification={notification}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-secondary mt-l">
                  No updates. We'll notify you when there's news about your
                  watched spots.
                </p>
              )}
            </ErrorBoundary>

            <div id="watchlist-map" className="map-wrapper center mt-l">
              <ErrorBoundary message={ERROR_BOUNDARY_MAP}>
                <SurfMap surfSpots={surfSpots} onFetcherSubmit={onFetcherSubmit} />
              </ErrorBoundary>
            </div>

            <div id="watched-spots" className="mt-l">
              <h2 className="watched-spots-title">Your Watched Surf Spots</h2>
              <ErrorBoundary message={ERROR_BOUNDARY_SURF_SPOT_LIST}>
                <SurfSpotList surfSpots={surfSpots} />
              </ErrorBoundary>
            </div>
          </>
        ) : (
          <div ref={emptyStateRef as RefObject<HTMLDivElement>}>
            <div className="mt-l animate-on-scroll">
              <EmptyState
                title="Build Your Watch List"
                description="Follow spots you are interested in to get updates on swell seasons, events, and travel deals. Use the map below to find spots to add."
                ctaText="Explore Surf Spots"
                onCtaClick={() => navigate('/surf-spots')}
              />
            </div>
          </div>
        )}
      </div>
    </Page>
  )
}
