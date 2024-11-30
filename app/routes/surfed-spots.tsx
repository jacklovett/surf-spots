import { LoaderFunction } from '@remix-run/node'
import {
  json,
  useLoaderData,
  useNavigate,
  useNavigation,
} from '@remix-run/react'
import {
  ContentStatus,
  Details,
  ErrorBoundary,
  Loading,
  Page,
  SurfMap,
  SurfSpotList,
  Widget,
} from '~/components'
import { get } from '~/services/networkService'
import { getSession, requireSessionCookie } from '~/services/session.server'
import { SurfedSpotsSummary } from '~/types/surfedSpotsSummary'

interface LoaderData {
  surfedSpotsSummary?: SurfedSpotsSummary
  error?: string
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireSessionCookie(request)

  const session = await getSession(request.headers.get('Cookie'))
  const user = session.get('user')
  const userId = user?.id

  try {
    const surfedSpotsSummary = await get(`user-spots/${userId}`, {
      headers: {
        Cookie: `${request.headers.get('Cookie')}`,
      },
    })
    console.log(surfedSpotsSummary)
    return json<LoaderData>(
      { surfedSpotsSummary: surfedSpotsSummary as SurfedSpotsSummary },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
      },
    )
  } catch (error) {
    console.error('Error fetching surf spots:', error)
    return json<LoaderData>(
      {
        error: `We couldn't find the surf spots right now. Please try again later.`,
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        },
      },
    )
  }
}

export default function SurfedSpots() {
  const navigate = useNavigate()
  const { state } = useNavigation()
  const loading = state === 'loading'

  const { surfedSpotsSummary, error } = useLoaderData<LoaderData>()

  if (error || loading) {
    return (
      <ContentStatus>
        {loading && <Loading />}
        {!loading && <p>{error}</p>}
      </ContentStatus>
    )
  }

  console.log(surfedSpotsSummary)

  // Destructure with default values
  const {
    surfedSpots = [],
    totalCount = 0,
    countryCount = 0,
    continentCount = 0,
    mostSurfedSpotType = null,
  } = surfedSpotsSummary || {}

  const surfedSpotsFound = surfedSpots.length > 0

  return (
    <Page showHeader>
      <div className="column mt">
        <div className="column content mt">
          <h1>Surfed spots</h1>
          <h2>Overview</h2>
        </div>
        <div className="column content mb">
          <div className="row center gap">
            <Widget title="Total" value={totalCount} />
            <Widget title="Countries" value={countryCount} />
            <Widget title="Continents" value={continentCount} />
          </div>
          <div className="row center gap mv border surfed-spots-extras">
            <Details
              label="Most Surfed Break Type"
              value={`${mostSurfedSpotType ?? '-'}`}
            />
            <Details label="Most Surfed Beach Bottom" value={`Sand`} />
            <Details
              label="Estimated Skill Level"
              value={`Beginner - Intermediate`}
            />
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
                  navigate,
                }}
              />
            )}
          </div>
        </ErrorBoundary>
      </div>
    </Page>
  )
}
