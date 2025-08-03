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

  return (
    <Page showHeader>
      <div className="column mt">
        <div className="content mt">
          <h1>Surfed Spots</h1>
          <h2>Overview</h2>
        </div>
        <div className="content mb pb">
          <div className="row spot-details surfed-spots-overview mb">
            <Details label="Total spots" value={totalCount} />
            <Details label="Continents" value={continentCount} />
            <Details label="Countries" value={countryCount} />
          </div>
          <div className="row surfed-spots-overview-secondary mb">
            <Details
              label="Most Surfed Break Type"
              value={`${mostSurfedSpotType ?? '-'}`}
            />
            <Details
              label="Most Surfed Beach Type"
              value={`${mostSurfedBeachBottomType ?? '-'}`}
            />
            <Details label="Skill Level" value={`${skillLevel ?? '-'}`} />
          </div>
        </div>
        <ErrorBoundary message="Uh-oh! Something went wrong displaying the map!">
          <SurfMap />
        </ErrorBoundary>
        <ErrorBoundary message="Unable to load surf spot list">
          <div className="content w-full mv">
            {!surfedSpotsFound && (
              <ContentStatus>
                <p>No surf spots found</p>
              </ContentStatus>
            )}
            {surfedSpotsFound && (
              <SurfSpotList
                {...{
                  surfSpots: surfedSpots,
                }}
              />
            )}
          </div>
        </ErrorBoundary>
      </div>
    </Page>
  )
}
