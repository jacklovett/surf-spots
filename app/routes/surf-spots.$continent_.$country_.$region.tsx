import { data, Link, useLoaderData } from 'react-router'
import { ContentStatus } from '~/components'
import { cacheControlHeader, get } from '~/services/networkService'
import type { SurfSpot, Region } from '~/types/surfSpots'

interface LoaderData {
  surfSpots: SurfSpot[]
  error?: string
  regionDetails?: Region
}

interface LoaderParams {
  region: string
}

export const loader = async ({ params }: { params: LoaderParams }) => {
  const { region } = params

  try {
    const regionDetails = await get<Region>(`regions/${region}`)
    const surfSpots = await get<SurfSpot[]>(`surf-spots/region/${region}`)

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
