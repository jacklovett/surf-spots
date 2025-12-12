import { RefObject } from 'react'
import {
  data,
  LoaderFunction,
  useLoaderData,
  useNavigation,
  useNavigate,
} from 'react-router'
import {
  ContentStatus,
  EmptyState,
  ErrorBoundary,
  TripPlannerButton,
  Loading,
  Page,
  Rating,
  SurfMap,
  SurfSpotList,
} from '~/components'
import { useScrollReveal } from '~/hooks'
import { cacheControlHeader, get } from '~/services/networkService'
import { requireSessionCookie } from '~/services/session.server'
import { SurfedSpotsSummary } from '~/types/surfedSpotsSummary'
import { SurfSpot } from '~/types/surfSpots'

interface LoaderData {
  surfedSpotsSummary?: SurfedSpotsSummary
  error?: string
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireSessionCookie(request)
  const userId = user?.id

  const cookie = request.headers.get('Cookie') ?? ''

  try {
    const surfedSpotsSummary = await get(`user-spots/${userId}`, {
      headers: {
        Cookie: cookie,
      },
    })
    return data<LoaderData>(
      { surfedSpotsSummary: surfedSpotsSummary as SurfedSpotsSummary },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    console.error('Error fetching surf spots:', error)
    return data<LoaderData>(
      {
        error: `We couldn't find the surf spots right now. Please try again later.`,
      },
      {
        status: 500,
      },
    )
  }
}

// Helper function to get surf explorer level based on countries surfed
const getSurfExplorerLevel = (countryCount: number) => {
  if (countryCount === 0) return 'Go Surf!'
  if (countryCount <= 5) return 'Local Explorer'
  if (countryCount <= 10) return 'Regional Explorer'
  if (countryCount <= 15) return 'Globe Trotter'
  return 'World Nomad'
}

// Helper function to get favorite wave direction based on surfed spots
const getFavoriteWaveDirection = (surfedSpots: SurfSpot[]) => {
  if (!surfedSpots || surfedSpots.length === 0) return null

  // Count spots by wave direction
  const waveDirectionCounts = surfedSpots.reduce(
    (acc, spot) => {
      if (spot.waveDirection) {
        acc[spot.waveDirection] = (acc[spot.waveDirection] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  // Find the most common wave direction
  let maxCount = 0
  let favoriteDirection: string | null = null

  Object.entries(waveDirectionCounts).forEach(([direction, count]) => {
    if (count > maxCount) {
      maxCount = count
      favoriteDirection = direction
    }
  })

  return favoriteDirection
}

export default function SurfedSpots() {
  const { state } = useNavigation()
  const navigate = useNavigate()
  const loading = state === 'loading'

  const { surfedSpotsSummary, error } = useLoaderData<LoaderData>()

  // Hooks to animate cards when they scroll into view
  const recentSpotsRef = useScrollReveal()
  const preferencesRef = useScrollReveal()

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
  if (loading || !surfedSpotsSummary) {
    return (
      <Page showHeader>
        <ContentStatus>
          <Loading />
        </ContentStatus>
      </Page>
    )
  }

  // Destructure - no need for defaults since we checked above
  const {
    surfedSpots,
    totalCount = 0,
    countryCount = 0,
    continentCount = 0,
    mostSurfedSpotType = null,
    mostSurfedBeachBottomType = null,
  } = surfedSpotsSummary

  const surfedSpotsFound = surfedSpots.length > 0
  // Extract surfSpot from each SurfedSpotItem - backend should already set flags
  const surfSpots = surfedSpots.map((item) => item.surfSpot)

  // TODO: Refine and move calculation to backend
  const favoriteWaveDirection = getFavoriteWaveDirection(surfSpots)

  // Get most recent surf spots (last 5)
  const recentSpots = surfSpots.slice(0, 5)

  return (
    <Page showHeader>
      <TripPlannerButton onOpenTripPlanner={() => navigate('/trip-planner')} />
      <div className="info-page-content mv map-content">
        <h1>Surfed Spots</h1>

        {/* Stats Overview */}
        <div className="stats-overview mt-l">
          <div className="stat-card primary">
            <div className="stat-value">{totalCount}</div>
            <div className="stat-label">Total Spots Surfed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{countryCount}</div>
            <div className="stat-label">Countries</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{continentCount}</div>
            <div className="stat-label">Continents</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Explorer Level</div>
            <div className="stat-value">
              {getSurfExplorerLevel(countryCount)}
            </div>
          </div>
        </div>

        {/* Wave Preferences */}
        <div className="wave-preferences">
          <h2>Wave Preferences</h2>
          <div
            ref={preferencesRef as RefObject<HTMLDivElement>}
            className="preferences-list"
          >
            <div className="preference-row animate-on-scroll">
              <span className="preference-label">Favorite Break</span>
              <span className="preference-value">
                {mostSurfedSpotType || '-'}
              </span>
            </div>
            <div className="preference-row animate-on-scroll">
              <span className="preference-label">Beach Type</span>
              <span className="preference-value">
                {mostSurfedBeachBottomType || '-'}
              </span>
            </div>
            <div className="preference-row animate-on-scroll">
              <span className="preference-label">Favorite Direction</span>
              <span className="preference-value">
                {favoriteWaveDirection || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Surf Spots */}
        {recentSpots.length > 0 && (
          <div className="recent-spots-section">
            <h2>Recently Surfed</h2>
            <div
              ref={recentSpotsRef as RefObject<HTMLDivElement>}
              className="recent-spots-grid"
            >
              {recentSpots.map((spot) => (
                <div
                  key={spot.id}
                  className="recent-spot-card animate-on-scroll"
                >
                  <div className="spot-info">
                    <h4>{spot.name}</h4>
                    <p className="spot-location">
                      {spot.country?.name}, {spot.continent?.name}
                    </p>
                    <p>{`Added: ${new Date().toLocaleDateString()}`}</p>
                    <div className="spot-rating">
                      <Rating value={spot.rating} readOnly />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map Section */}
        <h2>Your Surf Journey Map</h2>
        <div className="map-wrapper center">
          <ErrorBoundary message="Uh-oh! Something went wrong displaying the map!">
            <SurfMap surfSpots={surfSpots} />
          </ErrorBoundary>
        </div>
        {/* All Surf Spots List */}
        <div className="spots-section mt-l">
          <h2>All Surfed Spots</h2>
          <ErrorBoundary message="Unable to load surf spot list">
            {!surfedSpotsFound && (
              <EmptyState
                title="Start Your Surf Journey"
                description="You haven't surfed any spots yet. Start tracking your surf journey by adding your first surfed spot!"
                ctaText="Explore Surf Spots"
                onCtaClick={() => navigate('/surf-spots')}
              />
            )}
            {surfedSpotsFound && <SurfSpotList surfSpots={surfSpots} />}
          </ErrorBoundary>
        </div>
      </div>
    </Page>
  )
}
