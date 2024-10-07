import { json, Link, useLoaderData, useParams } from '@remix-run/react'
import { get } from '~/services/networkService'
import type { Continent, Country } from '~/types/surfSpots'

interface LoaderData {
  countries: Country[]
  error?: string
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
    return json<LoaderData>(
      {
        countries: [],
        error: `We're having trouble finding countries right now. Please try again later.`,
      },
      { status: 500 },
    )
  }
}

export default function Continent() {
  const { continent } = useParams()
  const { countries, continentDetails, error } = useLoaderData<LoaderData>()

  if (error) {
    throw new Error(error)
  }

  if (!continentDetails) {
    throw new Error("Couldn't find details for this continent")
  }

  const { name, description } = continentDetails

  return (
    <div>
      <h3>{name}</h3>
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
          <p>No countries found</p>
        )}
      </div>
    </div>
  )
}
