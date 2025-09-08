import { data, Link, useLoaderData } from 'react-router'
import { ContentStatus } from '~/components'
import { cacheControlHeader, get } from '~/services/networkService'
import { Continent } from '~/types/surfSpots'

interface LoaderData {
  continents: Continent[]
  error?: string
}

export const loader = async () => {
  try {
    const continents = await get<Continent[]>(`continents`)
    // Cache the response for 1 hour and serve stale data for up to 1 day
    return data<LoaderData>(
      { continents: continents ?? [] },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    console.error('Error occurred fetching continents:', error)
    return data<LoaderData>(
      {
        continents: [],
        error: `We couldn't find the continents right now. Please try again later.`,
      },
      {
        status: 500,
      },
    )
  }
}

export default function Continents() {
  const { continents = [], error } = useLoaderData<LoaderData>()

  if (error || continents.length === 0) {
    return (
      <ContentStatus isError>
        <p>{error ?? 'Continent list not found.'}</p>
      </ContentStatus>
    )
  }

  return (
    <div className="content column">
      {continents.map((continent) => {
        const { id, name, slug } = continent
        return (
          <Link key={id} to={`/surf-spots/${slug}`} prefetch="intent">
            <p className="list-item">{name}</p>
          </Link>
        )
      })}
    </div>
  )
}
