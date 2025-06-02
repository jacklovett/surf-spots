import {
  data,
  LoaderFunction,
  useLoaderData,
  useNavigation,
} from 'react-router'

import { requireSessionCookie } from '~/services/session.server'

import {
  ContentStatus,
  ErrorBoundary,
  Loading,
  Page,
  SurfMap,
  SurfSpotList,
} from '~/components'
import { WatchedSurfSpotsSummary } from '~/types/watchedSurfSpotsSummary'
import { cacheControlHeader, get } from '~/services/networkService'

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
  const loading = state === 'loading'

  const { watchedSurfSpotsSummary, error } = useLoaderData<LoaderData>()

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

  const { surfSpots = [], notifications = [] } = watchedSurfSpotsSummary || {}

  const hasNotifications = notifications.length > 0
  const surfSpotsFound = surfSpots.length > 0

  return (
    <Page showHeader>
      <div className="column h-full content mt">
        <h1>Watch List</h1>
        <p>
          Here, we'll keep you updated on swell seasons, local news, events, and
          travel deals for all the surf spots you're interested in. Use these
          updates to help plan your next surf trip
        </p>
        <ErrorBoundary message="Uh-oh! Something went wrong displaying the latest updates">
          {!hasNotifications && (
            <ContentStatus>
              <p>No updates found for your watched surf spots</p>
            </ContentStatus>
          )}
          {hasNotifications && (
            <div className="flex column gap">
              {notifications.map((notification) => {
                const { title, description, link } = notification
                return (
                  <div className="flex column gap">
                    <p className="bold">{title}</p>
                    <p>{description}</p>
                    {link && (
                      <a
                        key={link}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link}
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </ErrorBoundary>
        <ErrorBoundary message="Uh-oh! Something went wrong displaying the map!">
          <SurfMap />
        </ErrorBoundary>
        <ErrorBoundary message="Unable to load surf spot list">
          {!surfSpotsFound && (
            <ContentStatus>
              <p>
                No watched surf spots found. Add some spots to your watch list
                so you can stay up to date.
              </p>
            </ContentStatus>
          )}
          {surfSpotsFound && (
            <SurfSpotList
              {...{
                surfSpots,
              }}
            />
          )}
        </ErrorBoundary>
      </div>
    </Page>
  )
}
