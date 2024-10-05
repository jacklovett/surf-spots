import { json, Link, useLoaderData, useParams } from '@remix-run/react'
import { get } from '~/services/networkService'
import type { SurfSpot, Region } from '~/types/surfSpots'

interface LoaderData {
  surfSpots: SurfSpot[]
  error?: string
  regionDetails?: Region
}

export const loader = async (params: { region: string }) => {
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
  const { continent, country, region } = useParams()
  const { surfSpots, regionDetails, error } = useLoaderData<LoaderData>()

  if (error) {
    throw new Error(error)
  }

  if (!regionDetails) {
    throw new Error("Couldn't find details for this region")
  }

  if (surfSpots.length === 0) {
    throw new Error('No surf spots found!')
  }

  const { name, description } = regionDetails

  return (
    <div>
      <h3 className="title">{name}</h3>
      <p>{description}</p>
      <div className="list-map">
        {surfSpots.map((surfSpot) => {
          const { id, name, slug } = surfSpot
          return (
            <Link
              key={id}
              to={`/surf-spots/${continent}/${country}/${region}/${slug}`}
            >
              {name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
