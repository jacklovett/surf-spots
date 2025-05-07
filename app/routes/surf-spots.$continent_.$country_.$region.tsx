import { data, Link, LoaderFunction, useLoaderData } from 'react-router'
import { ContentStatus } from '~/components'
import { cacheControlHeader, get } from '~/services/networkService'
import { getSession } from '~/services/session.server'
import type { SurfSpot, Region } from '~/types/surfSpots'

interface LoaderData {
  surfSpots: SurfSpot[]
  error?: string
  regionDetails?: Region
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { region } = params

  const session = await getSession(request.headers.get('Cookie'))
  const user = session.get('user')
  const userId = user?.id

  const surfSpotsFetchUrl = userId
    ? `surf-spots/region/${region}?userId=${userId}`
    : `surf-spots/region/${region}`

  try {
    const regionDetails = await get<Region>(`regions/${region}`)
    const surfSpots = await get<SurfSpot[]>(surfSpotsFetchUrl)

    return data<LoaderData>(
      { surfSpots: surfSpots ?? [], regionDetails },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    return data<LoaderData>(
      {
        surfSpots: [],
        error: `We couldn't find the surf spots right now. Please try again later.`,
      },
      {
        status: 500,
      },
    )
  }
}

export default function Region() {
  const { surfSpots, regionDetails, error } = useLoaderData<LoaderData>()

  if (error || !regionDetails) {
    return (
      <ContentStatus isError>
        <p>{error ?? "Couldn't find details for this region"}</p>
      </ContentStatus>
    )
  }

  const { name, description } = regionDetails

  return (
    <div className="content">
      <h1>{name}</h1>
      <p className="description">{description}</p>
      <div className="list-map">
        {surfSpots.length > 0 ? (
          surfSpots.map((surfSpot) => {
            const { id, name, path } = surfSpot
            return (
              <Link key={id} to={path} prefetch="intent">
                {name}
              </Link>
            )
          })
        ) : (
          <p>No surf spots found</p>
        )}
      </div>
    </div>
  )
}
