import { json, Link, useLoaderData, useParams } from '@remix-run/react'
import { get } from '~/services/networkService'

interface LoaderData {
  regions: string[]
}

export const loader = async (params: { country: string }) => {
  const { country } = params
  const regions = await get<string[]>(`/api/countries/${country}/regions`)
  return json<LoaderData>({ regions: regions ?? [] })
}

export default function Country() {
  const { regions } = useLoaderData<LoaderData>()
  const { continent, country } = useParams()

  return (
    <div>
      <h3 className="title">{continent}</h3>
      <p className="title">{country}</p>
      <div className="list-map">
        {regions.length > 0 ? (
          regions.map((region) => (
            <Link
              key={region}
              to={`/surf-spots/${continent}/${country}/${region}`}
            >
              {region}
            </Link>
          ))
        ) : (
          <p>No regions available.</p>
        )}
      </div>
    </div>
  )
}
