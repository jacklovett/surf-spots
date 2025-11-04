import {
  data,
  LoaderFunction,
  useLoaderData,
  useNavigation,
} from 'react-router'
import {
  Chip,
  ContentStatus,
  ErrorBoundary,
  Loading,
  Page,
  Rating,
  SurfMap,
  SurfSpotList,
} from '~/components'
import { cacheControlHeader, get } from '~/services/networkService'
import { requireSessionCookie } from '~/services/session.server'
import { SurfedSpotsSummary } from '~/types/surfedSpotsSummary'
import { SkillLevel, SurfSpot } from '~/types/surfSpots'

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

// Helper function to get skill level display based on surfed spots
const getSkillLevelDisplay = (surfedSpots: SurfSpot[]) => {
  if (surfedSpots.length === 0) return 'Not assessed'

  // Count spots by skill level
  const skillLevelCounts = surfedSpots.reduce(
    (acc, spot) => {
      const level =
        spot.skillLevel && spot.skillLevel !== SkillLevel.ALL_LEVELS
          ? spot.skillLevel
          : SkillLevel.BEGINNER
      acc[level] = (acc[level] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Calculate percentages
  const total = surfedSpots.length
  const percentages = {
    beginner:
      (skillLevelCounts[
        SkillLevel.BEGINNER || SkillLevel.BEGINNER_INTERMEDIATE
      ] || 0) / total,
    intermediate:
      (skillLevelCounts[
        SkillLevel.INTERMEDIATE || SkillLevel.INTERMEDIATE_ADVANCED
      ] || 0) / total,
    advanced: (skillLevelCounts.advanced || 0) / total,
  }

  // Determine skill level based on what they surf most
  if (percentages.advanced >= 0.4) return 'Advanced'
  if (percentages.intermediate >= 0.4) return 'Intermediate'
  if (percentages.beginner >= 0.6) return 'Beginner'

  // If no clear majority, use the highest level they've surfed
  if (skillLevelCounts.advanced > 0) return 'Advanced'
  if (skillLevelCounts.intermediate > 0) return 'Intermediate'
  return 'Beginner'
}

export default function SurfedSpots() {
  const { state } = useNavigation()
  const loading = state === 'loading'

  const { surfedSpotsSummary, error } = useLoaderData<LoaderData>()

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

  // Destructure with default values
  const {
    surfedSpots = [],
    totalCount = 0,
    countryCount = 0,
    continentCount = 0,
    mostSurfedSpotType = null,
    mostSurfedBeachBottomType = null,
  } = surfedSpotsSummary || {}

  const surfedSpotsFound = surfedSpots.length > 0
  // Extract surfSpot from each SurfedSpotItem for calculations
  const surfSpots = surfedSpots.map((item) => item.surfSpot)

  // TODO: Refine and move calculation to backend
  const displaySkillLevel = getSkillLevelDisplay(surfSpots)

  // Get most recent surf spots (last 5)
  const recentSpots = surfSpots.slice(0, 5)

  return (
    <Page showHeader>
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
          <div className="preferences-list">
            <div className="preference-row">
              <span className="preference-label">Favorite Break</span>
              <span className="preference-value">
                {mostSurfedSpotType || '-'}
              </span>
            </div>
            <div className="preference-row">
              <span className="preference-label">Beach Type</span>
              <span className="preference-value">
                {mostSurfedBeachBottomType || '-'}
              </span>
            </div>
            <div className="preference-row">
              <span className="preference-label">Assessed Skill Level</span>
              <span className="preference-value">
                {displaySkillLevel || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Surf Spots */}
        {recentSpots.length > 0 && (
          <div className="recent-spots-section">
            <h2>Recently Surfed</h2>
            <div className="recent-spots-grid">
              {recentSpots.map((spot) => (
                <div key={spot.id} className="recent-spot-card">
                  <div className="spot-info">
                    <h4>{spot.name}</h4>
                    <p className="spot-location">
                      {spot.country?.name}, {spot.continent?.name}
                    </p>
                    {/* TODO: Add the actual date the spot was added */}
                    <p>{`Added: ${new Date().toLocaleDateString()}`}</p>
                    <div className="spot-rating">
                      <Rating value={spot.rating} readOnly />
                    </div>
                  </div>
                  <div className="mh">
                    <Chip label={spot.type} isFilled={true} />
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
              <div className="empty-state">
                <h3>Start Your Surf Journey</h3>
                <p>
                  You haven't surfed any spots yet. Start tracking your surf
                  journey by adding your first surfed spot!
                </p>
                <div className="empty-actions">
                  <a href="/surf-spots" className="btn-primary">
                    Explore Surf Spots
                  </a>
                </div>
              </div>
            )}
            {surfedSpotsFound && <SurfSpotList surfSpots={surfSpots} />}
          </ErrorBoundary>
        </div>
      </div>
    </Page>
  )
}
