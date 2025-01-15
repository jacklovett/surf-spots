import { LoaderFunction } from '@remix-run/node'

import { requireSessionCookie } from '~/services/session.server'
import { SurfSpot } from '~/types/surfSpots'

import { ContentStatus, ErrorBoundary, Page, SurfSpotList } from '~/components'

export const loader: LoaderFunction = async ({ request }) => {
  await requireSessionCookie(request)
  return []
}

export default function Wishlist() {
  const surfSpots: SurfSpot[] = []
  const surfSpotsFound = surfSpots?.length > 0

  const error = null

  return (
    <Page showHeader error={error}>
      <div className="column content mt">
        <h1>Watch list</h1>
        <p>
          This is the list of surf spots you're following. From this list we'll
          keep you up to date with all kinds of things happening around these
          areas. From swell updates, water quality and conditions, news to Great
          deals that help you get to experiencing these waves!
        </p>
        <ErrorBoundary message="Unable to load surf spot list">
          {!surfSpotsFound && (
            <ContentStatus>
              <p>No surf spots found</p>
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
