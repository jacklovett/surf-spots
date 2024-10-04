import { json, Link, useLoaderData, useParams } from '@remix-run/react'
import { get } from '~/services/networkService'
import type { Continent, Country } from '~/types/surfSpots'

interface LoaderData {
  countries: Country[]
  continentDetails?: Continent
}

interface LoaderParams {
  continent: string
}

export const loader = async ({ params }: { params: LoaderParams }) => {
  const { continent } = params

  try {
    const continentDetails = await get<Continent>(`continents/${continent}`)
    const countries = await get<Country[]>(`countries/continent/${continent}`)

    return json<LoaderData>({
      countries: countries ?? [],
      continentDetails,
    })
  } catch (error) {
    console.error('Error fetching countries:', error)
    return json<LoaderData>({ countries: [] })
  }
}

export default function Continent() {
  const { continent } = useParams()
  const { countries, continentDetails } = useLoaderData<LoaderData>()

  if (!continentDetails) {
    return // throw error?
  }

  const { name, description } = continentDetails

  return (
    <div>
      <h3 className="title">{name}</h3>
      <p>{description}</p>
      <div className="list-map">
        {countries.length > 0 ? (
          countries.map((country) => {
            const { id, name, slug } = country
            return (
              <Link key={id} to={`/surf-spots/${continent}/${slug}`}>
                {name}
              </Link>
            )
          })
        ) : (
          <p>No countries available.</p>
        )}
      </div>
    </div>
  )
}
