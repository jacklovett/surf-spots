import { data, Link, useLoaderData } from 'react-router'
import { ContentStatus } from '~/components'
import { cacheControlHeader, get, getDisplayMessage } from '~/services/networkService'
import { Continent } from '~/types/surfSpots'
import { ERROR_LOAD_CONTINENTS } from '~/utils/errorUtils'

/** Timeout for continents request (e.g. cold start). Generous for production. */
const CONTINENTS_REQUEST_TIMEOUT_MS = 30_000

interface LoaderData {
  continents: Continent[]
  error?: string
}

export const loader = async () => {
  try {
    const continents = await get<Continent[]>(`continents`, {
      timeoutMs: CONTINENTS_REQUEST_TIMEOUT_MS,
    })
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
        error: getDisplayMessage(error, ERROR_LOAD_CONTINENTS),
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
