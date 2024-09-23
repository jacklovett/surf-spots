import { json, Link, useLoaderData, useParams } from '@remix-run/react'
import { get } from '~/services/networkService'

interface LoaderData {
  countries: string[]
}

export const loader = async (params: { continent: string }) => {
  const { continent } = params
  const countries = await get<string[]>(`/api/countries/continent/${continent}`)
  return json<LoaderData>({ countries: countries ?? [] })
}

export default function Continent() {
  const { continent } = useParams()
  const { countries } = useLoaderData<LoaderData>()

  return (
    <div>
      <h3 className="title">{continent}</h3>
      <div className="list-map">
        {countries.length > 0 ? (
          countries.map((country) => (
            <Link key={country} to={`/surf-spots/${continent}/${country}`}>
              {country}
            </Link>
          ))
        ) : (
          <p>No countries available.</p>
        )}
      </div>
    </div>
  )
}
