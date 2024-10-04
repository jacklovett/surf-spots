import { useNavigate } from '@remix-run/react'
import {
  ContentStatus,
  ErrorBoundary,
  Page,
  SurfSpotList,
  Widget,
} from '~/components'
import { SurfSpot } from '~/types/surfSpots'

export default function SurfedSpots() {
  const navigate = useNavigate()

  const surfSpots: SurfSpot[] = []
  const loading = false
  const error = null

  const renderContent = () => {
    const surfSpotsFound = surfSpots?.length > 0

    const totalSurfedSpots = surfSpots?.length ?? 0
    let numContinents = 0
    let numCountries = 0

    if (surfSpotsFound) {
      numContinents = new Set(surfSpots.map((spot) => spot.continent)).size
      numCountries = new Set(surfSpots.map((spot) => spot.country)).size
    }

    return (
      <div className="column center">
        <h3>Surfed spots</h3>
        <div className="row summary">
          <ErrorBoundary>
            <Widget title="Total Spots" value={totalSurfedSpots} />
            <Widget title="No. Countries" value={numCountries} />
            <Widget title="No. Continents" value={numContinents} />
          </ErrorBoundary>
        </div>
        <ErrorBoundary message="Unable to load surf spot list">
          <div className="column center">
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
          </div>
        </ErrorBoundary>
      </div>
    )
  }

  return (
    <Page showHeader loading={loading} error={error}>
      {renderContent()}
    </Page>
  )
}
