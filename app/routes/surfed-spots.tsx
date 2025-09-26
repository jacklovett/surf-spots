import {
  data,
  LoaderFunction,
  useLoaderData,
  useNavigation,
} from 'react-router'
import {
  ContentStatus,
  Details,
  ErrorBoundary,
  Loading,
  Page,
  SurfMap,
  SurfSpotList,
} from '~/components'
import { cacheControlHeader, get } from '~/services/networkService'
import { requireSessionCookie } from '~/services/session.server'
import { SurfedSpotsSummary } from '~/types/surfedSpotsSummary'
import { SkillLevel } from '~/types/surfSpots'

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

// Helper function to get skill level display based on surfed spots
const getSkillLevelDisplay = (
  skillLevel: SkillLevel | null,
  surfedSpots: any[],
) => {
  if (skillLevel) return skillLevel

  if (surfedSpots.length === 0) return 'Not assessed'

  // Count spots by skill level
  const skillLevelCounts = surfedSpots.reduce((acc, spot) => {
    const level = spot.skillLevel || 'beginner'
    acc[level] = (acc[level] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate percentages
  const total = surfedSpots.length
  const percentages = {
    beginner: (skillLevelCounts.beginner || 0) / total,
    intermediate: (skillLevelCounts.intermediate || 0) / total,
    advanced: (skillLevelCounts.advanced || 0) / total,
    expert: (skillLevelCounts.expert || 0) / total,
  }

  // Determine skill level based on what they surf most
  if (percentages.expert >= 0.4) return 'Expert'
  if (percentages.advanced >= 0.4) return 'Advanced'
  if (percentages.intermediate >= 0.4) return 'Intermediate'
  if (percentages.beginner >= 0.6) return 'Beginner'

  // If no clear majority, use the highest level they've surfed
  if (skillLevelCounts.expert > 0) return 'Expert'
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
    skillLevel = null,
  } = surfedSpotsSummary || {}

  const surfedSpotsFound = surfedSpots.length > 0
  const displaySkillLevel = getSkillLevelDisplay(skillLevel, surfedSpots)

  // Get most recent surf spots (last 5)
  const recentSpots = surfedSpots.slice(0, 5)

  // Calculate average rating
  const averageRating =
    surfedSpots.length > 0
      ? (
          surfedSpots.reduce((sum, spot) => sum + (spot.rating || 0), 0) /
          surfedSpots.length
        ).toFixed(1)
      : 0

  // Calculate preferred tide
  const getPreferredTide = () => {
    if (surfedSpots.length === 0) return null

    const tideCounts = surfedSpots.reduce((acc, spot) => {
      const tide = spot.tide || 'Any'
      acc[tide] = (acc[tide] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostSurfed = Object.entries(tideCounts).reduce((a, b) =>
      tideCounts[a[0]] > tideCounts[b[0]] ? a : b,
    )

    return mostSurfed ? mostSurfed[0] : null
  }

  const preferredTide = getPreferredTide()

  return (
    <Page showHeader>
      <div className="surfed-spots-page">
        {/* Hero Section */}
        <div className="hero-section">
          <h1>Your Surf Journey</h1>
          <p className="hero-subtitle">
            Track your progress across countries, continents, and different
            types of waves
          </p>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card primary">
            <div className="stat-number">{totalCount}</div>
            <div className="stat-label">Total Spots Surfed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{continentCount}</div>
            <div className="stat-label">Continents</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{countryCount}</div>
            <div className="stat-label">Countries</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{averageRating}</div>
            <div className="stat-label">Avg Rating</div>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="detailed-stats">
          <h2>Your Surf Profile</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-content">
                <div className="stat-title">Favorite Break Type</div>
                <div className="stat-value center">
                  {mostSurfedSpotType || '-'}
                </div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-content">
                <div className="stat-title">Preferred Beach Type</div>
                <div className="stat-value center">
                  {mostSurfedBeachBottomType || '-'}
                </div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-content">
                <div className="stat-title">Skill Level</div>
                <div className="stat-value center">{displaySkillLevel}</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-content">
                <div className="stat-title">Preferred Tide</div>
                <div className="stat-value center">{preferredTide || '-'}</div>
              </div>
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
                    <div className="spot-rating">
                      <span className="rating-text">
                        Rating: {spot.rating || 0}/5
                      </span>
                    </div>
                  </div>
                  <div className="spot-type">
                    <span className="type-badge">{spot.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map Section */}
        <div className="map-section">
          <h2>Your Surf Journey Map</h2>
          <ErrorBoundary message="Uh-oh! Something went wrong displaying the map!">
            <SurfMap surfSpots={surfedSpots} />
          </ErrorBoundary>
        </div>

        {/* All Surf Spots List */}
        <div className="spots-section">
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
            {surfedSpotsFound && (
              <SurfSpotList
                {...{
                  surfSpots: surfedSpots,
                }}
              />
            )}
          </ErrorBoundary>
        </div>
      </div>
    </Page>
  )
}
