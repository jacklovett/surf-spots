import { json, Link, useLoaderData } from '@remix-run/react'
import { get } from '~/services/networkService'
import { Continent } from '~/types/surfSpots'

interface LoaderData {
  continents: Continent[]
}

export const loader = async () => {
  try {
    const continents = await get<Continent[]>(`continents`)
    return json<LoaderData>({ continents: continents ?? [] })
  } catch (error) {
    console.error('Error fetching continents:', error)
    return json<LoaderData>({ continents: [] })
  }
}

export default function Continents() {
  const { continents } = useLoaderData<LoaderData>()
  return (
    <div className="column">
      <div className="column">
        {continents.length > 0 ? (
          continents.map((continent) => {
            const { id, name, slug } = continent
            return (
              <div>
                <Link key={id} to={`/surf-spots/${slug}`}>
                  <p>{name}</p>
                </Link>
              </div>
            )
          })
        ) : (
          <p>No continents available.</p>
        )}
      </div>
    </div>
  )
}
