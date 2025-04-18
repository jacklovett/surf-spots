import { LoaderFunction } from 'react-router'

import { requireSessionCookie } from '~/services/session.server'
import { SurfSpot } from '~/types/surfSpots'

import { ContentStatus, ErrorBoundary, Page, SurfSpotList } from '~/components'

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireSessionCookie(request)
  const userId = user?.id
  // TODO: Get watched surf spots
  return []
}

export default function Wishlist() {
  const surfSpots: SurfSpot[] = []
  const surfSpotsFound = surfSpots?.length > 0

  const error = null

  return (
    <Page showHeader error={error}>
      <div className="column content mt">
        <h1>Watch List</h1>
        <p>
          Here, we'll keep you updated on swell seasons, local news, events, and
          travel deals for all the surf spots you're interested in. Use these
          updates to help plan your next surf trip
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
