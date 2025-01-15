import { LoaderFunction } from '@remix-run/node'
import { json, useLoaderData, useNavigation } from '@remix-run/react'
import {
  ContentStatus,
  Details,
  ErrorBoundary,
  Loading,
  Page,
  SurfMap,
  SurfSpotList,
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

  const cookie = request.headers.get('Cookie')

  const session = await getSession(cookie)
  const user = session.get('user')
  const userId = user?.id

  try {
    const surfedSpotsSummary = await get(`user-spots/${userId}`, {
      headers: {
        Cookie: `${cookie}`,
      },
    })
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
        <div className="column content mt">
          <h1>Surfed spots</h1>
          <h2>Overview</h2>
        </div>
        <div className="column content mb">
          <div className="row surfed-spots-overview mb">
            <Details label="🌊 Total spots" value={totalCount} />
            <Details label="🌍 Continents" value={continentCount} />
            <Details label="🗺️ Countries" value={countryCount} />
          </div>
          <div className="row mb">
            <Details
              label="🏄‍♂️ Most Surfed Break Type"
              value={`${mostSurfedSpotType ?? '-'}`}
            />
            <Details
              label="🏖️ Most Surfed Beach Type"
              value={`${mostSurfedBeachBottomType ?? '-'}`}
            />
            <Details label="🎯 Skill Level" value={`${skillLevel ?? '-'}`} />
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
