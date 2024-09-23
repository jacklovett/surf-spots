import { json, Link, useLoaderData, useParams } from '@remix-run/react'
import { get } from '~/services/networkService'

interface LoaderData {
  surfSpots: string[]
}

export const loader = async (params: { region: string }) => {
  const { region } = params
  const surfSpots = await get<string[]>(`/api/surf-spots/region/${region}`)
  return json<LoaderData>({ surfSpots: surfSpots ?? [] })
}

export default function Region() {
  const { surfSpots } = useLoaderData<LoaderData>()
  const { continent, country, region } = useParams()
  return (
    <div>
      <h3 className="title">{continent}</h3>
      <p className="title">{country}</p>
      <p className="title">{region}</p>
      <div className="list-map">
        {surfSpots.length > 0 ? (
          surfSpots.map((surfSpot) => (
            <Link
              key={surfSpot}
              to={`/surf-spots/${continent}/${country}/${region}/${surfSpot}`}
            >
              {surfSpot}
            </Link>
          ))
        ) : (
          <p>No surf spots found.</p>
        )}
      </div>
    </div>
  )
}
