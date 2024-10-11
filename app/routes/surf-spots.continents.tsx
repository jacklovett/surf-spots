import { json, Link, useLoaderData } from '@remix-run/react'
import { get } from '~/services/networkService'
import { Continent } from '~/types/surfSpots'

interface LoaderData {
  continents: Continent[]
  error?: string
}

export const loader = async () => {
  try {
    const continents = await get<Continent[]>(`continents`)
    return json<LoaderData>({ continents: continents ?? [] })
  } catch (error) {
    console.error('Error occurred fetching continents:', error)
    return json<LoaderData>(
      {
        continents: [],
        error: `We couldn't find the continents right now. Please try again later.`,
      },
      { status: 500 },
    )
  }
}

export default function Continents() {
  const { continents, error } = useLoaderData<LoaderData>()

  if (error) {
    throw new Error(error)
  }

  if (continents.length === 0) {
    throw new Error('No continents found!')
  }

  return (
    <div className="content column">
      {continents.map((continent) => {
        const { id, name, slug } = continent
        return (
          <Link key={id} to={`/surf-spots/${slug}`}>
            <p>{name}</p>
          </Link>
        )
      })}
    </div>
  )
}
