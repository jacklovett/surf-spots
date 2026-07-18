import { RefObject } from 'react'
import {
  data,
  ActionFunction,
  LoaderFunction,
  useLoaderData,
  useNavigation,
  useNavigate,
} from 'react-router'
import {
  ContentStatus,
  EmptyState,
  ErrorBoundary,
  Loading,
  Page,
  PageErrorRecoveryActions,
  SurfMap,
  SurfSpotList,
} from '~/components'
import {
  ERROR_BOUNDARY_MAP,
  ERROR_BOUNDARY_SURF_SPOT_LIST,
  ERROR_LOAD_SURFED_SPOTS,
} from '~/utils/errorUtils'
import { useScrollReveal, useSurfSpotActions } from '~/hooks'
import { cacheControlHeader, get, httpStatusFromNetworkError, isNetworkError } from '~/services/networkService'
import { requireSessionCookie } from '~/services/session.server'
import { surfSpotAction } from '~/services/surfSpot.server'
import { SurfedSpotsSummary } from '~/types/surfedSpotsSummary'
import { formatDate } from '~/utils/dateUtils'

interface LoaderData {
  surfedSpotsSummary?: SurfedSpotsSummary
  error?: string
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireSessionCookie(request)

  const cookie = request.headers.get('Cookie') ?? ''

  try {
    const userSpotsResponse = await get('user-spots', {
      headers: {
        Cookie: cookie,
      },
    })
    const surfedSpotsSummary = userSpotsResponse?.data
    return data<LoaderData>(
      { surfedSpotsSummary: surfedSpotsSummary as SurfedSpotsSummary },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    const status = isNetworkError(error) ? error.status : undefined
    console.error('Surfed spots loader: user spots fetch failed', {
      status,
      responseSummary: isNetworkError(error) ? error.responseSummary : undefined,
      message: error instanceof Error ? error.message : String(error),
    })

    return data<LoaderData>(
      { error: ERROR_LOAD_SURFED_SPOTS },
      {
        status: httpStatusFromNetworkError(error),
      },
    )
  }
}

export const action: ActionFunction = surfSpotAction

// Helper function to get surf explorer level based on countries surfed
const getSurfExplorerLevel = (countryCount: number) => {
  if (countryCount === 0) return 'Go Surf!'
  if (countryCount <= 5) return 'Local Explorer'
  if (countryCount <= 10) return 'Regional Explorer'
  if (countryCount <= 15) return 'Globe Trotter'
  return 'World Nomad'
}

export default function SurfedSpots() {
  const navigation = useNavigation()
  const navigate = useNavigate()
  const loading = navigation.state === 'loading'

  const { surfedSpotsSummary, error } = useLoaderData<LoaderData>()
  const { fetcher, onFetcherSubmit } = useSurfSpotActions()

  // Hooks to animate cards when they scroll into view
  const recentSpotsRef = useScrollReveal()
  const preferencesRef = useScrollReveal()

  if (error) {
    return (
      <Page showHeader>
        <ContentStatus isError actions={<PageErrorRecoveryActions />}>
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

  const {
    surfedSpots,
    totalCount = 0,
    countryCount = 0,
    continentCount = 0,
    mostSurfedSpotType = null,
    mostSurfedBeachBottomType = null,
    mostSurfedWaveDirection = null,
  } = surfedSpotsSummary

  const surfedSpotsFound = surfedSpots.length > 0
  // Extract surfSpot from each SurfedSpotItem - backend should already set flags
  const surfSpots = surfedSpots.map((item) => item.surfSpot)

  const recentSurfedSpots = surfedSpots.slice(0, 5)

  return (
    <Page showHeader>
      <div className="info-page-content mv map-content">
        <h1>Surfed Spots</h1>

        {/* Stats Overview */}
        <div className="stats-overview mt-l">
          <div className="stat-card primary">
            <div className="stat-label bold">Total Spots Surfed</div>
            <div className="stat-value">{totalCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label bold">Countries</div>
            <div className="stat-value">{countryCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label bold">Continents</div>
            <div className="stat-value">{continentCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label bold">Explorer Level</div>
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
            <div className="preference-card animate-on-scroll">
              <span className="preference-label bold">Favorite Break</span>
              <span className="preference-value">
                {mostSurfedSpotType || '-'}
              </span>
            </div>
            <div className="preference-card animate-on-scroll">
              <span className="preference-label bold">Beach Type</span>
              <span className="preference-value">
                {mostSurfedBeachBottomType || '-'}
              </span>
            </div>
            <div className="preference-card animate-on-scroll">
              <span className="preference-label bold">Favorite Direction</span>
              <span className="preference-value">
                {mostSurfedWaveDirection || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Surf Spots */}
        {recentSurfedSpots.length > 0 && (
          <div className="recent-spots-section">
            <h2>Recently Surfed</h2>
            <div
              ref={recentSpotsRef as RefObject<HTMLDivElement>}
              className="recent-spots-grid"
            >
              {recentSurfedSpots.map(({ surfSpot, addedAt }) => (
                <div
                  key={surfSpot.id}
                  className="recent-spot-card animate-on-scroll"
                  onClick={() => navigate(surfSpot.path)}
                >
                  <div className="spot-info">
                    <h4 className="bold">{surfSpot.name}</h4>
                    <p className="spot-location">
                      {surfSpot.country?.name}, {surfSpot.continent?.name}
                    </p>
                    <p>{`Added: ${formatDate(addedAt)}`}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map Section */}
        <h2>Your Surf Journey Map</h2>
        <div className="map-wrapper center">
          <ErrorBoundary message={ERROR_BOUNDARY_MAP}>
            <SurfMap
              surfSpots={surfSpots}
              onFetcherSubmit={onFetcherSubmit}
              surfActionFetcher={fetcher}
            />
          </ErrorBoundary>
        </div>
        {/* All Surf Spots List */}
        <div className="spots-section mt-l">
          <h2>All Surfed Spots</h2>
          <ErrorBoundary message={ERROR_BOUNDARY_SURF_SPOT_LIST}>
            {!surfedSpotsFound && (
              <EmptyState
                title="Start Your Surf Journey"
                description="No surfed spots recorded. Explore spots and add your first one to start your surf map."
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
