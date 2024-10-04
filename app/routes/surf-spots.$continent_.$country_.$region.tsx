import { json, Link, useLoaderData, useParams } from '@remix-run/react'
import { get } from '~/services/networkService'
import type { SurfSpot, Region } from '~/types/surfSpots'

interface LoaderData {
  surfSpots: SurfSpot[]
  regionDetails?: Region
}

export const loader = async (params: { region: string }) => {
  const { region } = params
  try {
    const regionDetails = await get<Region>(`region/${region}`)
    const surfSpots = await get<SurfSpot[]>(`surf-spots/region/${region}`)
    return json<LoaderData>({ surfSpots: surfSpots ?? [], regionDetails })
  } catch (error) {
    console.error('Error fetching surf spots:', error)
    return json<LoaderData>({ surfSpots: [] })
  }
}

export default function Region() {
  const { surfSpots, regionDetails } = useLoaderData<LoaderData>()
  const { continent, country, region } = useParams()

  if (!regionDetails) {
    return // throw error??
  }

  const { name, description } = regionDetails

  return (
    <div>
      <h3 className="title">{name}</h3>
      <p>{description}</p>
      <div className="list-map">
        {surfSpots.length > 0 ? (
          surfSpots.map((surfSpot) => {
            const { id, name, slug } = surfSpot
            return (
              <Link
                key={id}
                to={`/surf-spots/${continent}/${country}/${region}/${slug}`}
              >
                {name}
              </Link>
            )
          })
        ) : (
          <p>No surf spots found.</p>
        )}
      </div>
    </div>
  )
}
