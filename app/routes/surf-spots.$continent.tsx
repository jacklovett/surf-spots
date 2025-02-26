import { data, Link, useLoaderData, useParams } from '@remix-run/react'
import { ContentStatus } from '~/components'
import { cacheControlHeader, get } from '~/services/networkService'
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

    return data<LoaderData>(
      {
        countries: countries ?? [],
        continentDetails,
      },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    console.error('Error fetching countries:', error)
    return data<LoaderData>(
      {
        countries: [],
        error: `We're having trouble finding countries right now. Please try again later.`,
      },
      {
        status: 500,
      },
    )
  }
}

export default function Continent() {
  const { continent } = useParams()

  const { data } = useLoaderData<{ data: LoaderData }>()
  const { countries = [], continentDetails, error } = data

  if (error || !continentDetails) {
    return (
      <ContentStatus isError>
        <p>{error ?? "Couldn't find details for this continent"}</p>
      </ContentStatus>
    )
  }

  const { name, description } = continentDetails

  return (
    <div className="content">
      <h1>{name}</h1>
      <p className="description">{description}</p>
      <div className="list-map">
        {countries.length > 0 ? (
          countries.map((country) => {
            const { id, name, slug } = country
            return (
              <Link
                key={id}
                to={`/surf-spots/${continent}/${slug}`}
                prefetch="intent"
              >
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
