import { useNavigate } from '@remix-run/react'
import { ContentStatus, ErrorBoundary, Page, SurfSpotList } from '~/components'
import { SurfSpot } from '~/types/surfSpots'

export default function Wishlist() {
  const navigate = useNavigate()

  const surfSpots: SurfSpot[] = []
  const surfSpotsFound = surfSpots?.length > 0

  const loading = false
  const error = null

  return (
    <Page showHeader loading={loading} error={error}>
      <div className="column center">
        <h3>Wishlist</h3>
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
