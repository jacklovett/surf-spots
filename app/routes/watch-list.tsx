import { LoaderFunction } from '@remix-run/node'
import { useNavigate } from '@remix-run/react'

import { requireSessionCookie } from '~/services/session.server'
import { SurfSpot } from '~/types/surfSpots'

import { ContentStatus, ErrorBoundary, Page, SurfSpotList } from '~/components'

export const loader: LoaderFunction = async ({ request }) => {
  await requireSessionCookie(request)
  return []
}

export default function Wishlist() {
  const navigate = useNavigate()

  const surfSpots: SurfSpot[] = []
  const surfSpotsFound = surfSpots?.length > 0

  const error = null

  return (
    <Page showHeader error={error}>
      <div className="column center mt">
        <h3>Watch List</h3>
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
                navigate,
              }}
            />
          )}
        </ErrorBoundary>
      </div>
    </Page>
  )
}
