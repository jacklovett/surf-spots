import { json, Link, useLoaderData, useParams } from '@remix-run/react'
import { get } from '~/services/networkService'
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
    return json<LoaderData>({ surfSpots: surfSpots ?? [], regionDetails })
  } catch (error) {
    console.error('Error fetching surf spots:', error)
    return json<LoaderData>(
      {
        surfSpots: [],
        error: `We couldn't find the surf spots right now. Please try again later.`,
      },
      { status: 500 },
    )
  }
}

export default function Region() {
  const { surfSpots, regionDetails, error } = useLoaderData<LoaderData>()

  if (error) {
    throw new Error(error)
  }

  if (!regionDetails) {
    throw new Error("Couldn't find details for this region")
  }

  const { name, description } = regionDetails

  return (
    <div className="content">
      <h3>{name}</h3>
      <p>{description}</p>
      <div className="list-map">
        {surfSpots.length > 0 ? (
          surfSpots.map((surfSpot) => {
            const { id, name, path } = surfSpot
            return (
              <Link key={id} to={path}>
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
