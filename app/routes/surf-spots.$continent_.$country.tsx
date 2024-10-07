import { json, Link, useLoaderData, useParams } from '@remix-run/react'
import { get } from '~/services/networkService'
import type { Country, Region } from '~/types/surfSpots'

interface LoaderData {
  regions: Region[]
  error?: string
  countryDetails?: Country
}

interface LoaderParams {
  country: string
}

export const loader = async ({ params }: { params: LoaderParams }) => {
  const { country } = params
  try {
    const countryDetails = await get<Country>(`countries/${country}`)
    const regions = await get<Region[]>(`regions/${country}/regions`)
    return json<LoaderData>({ regions: regions ?? [], countryDetails })
  } catch (error) {
    console.error('Error fetching regions:', error)
    return json<LoaderData>(
      {
        regions: [],
        error: `We can't seem to locate the regions. Please try again later.`,
      },
      { status: 500 },
    )
  }
}

export default function Country() {
  const { continent, country } = useParams()
  const { regions, countryDetails, error } = useLoaderData<LoaderData>()

  if (error) {
    throw new Error(error)
  }

  if (!countryDetails) {
    throw new Error("Couldn't find details for this country")
  }

  const { name, description } = countryDetails

  return (
    <div>
      <h3>{name}</h3>
      <p>{description}</p>
      <div className="list-map">
        {regions.length > 0 ? (
          regions.map((region) => {
            const { id, name, slug } = region
            return (
              <Link key={id} to={`/surf-spots/${continent}/${country}/${slug}`}>
                {name}
              </Link>
            )
          })
        ) : (
          <p>No regions found</p>
        )}
      </div>
    </div>
  )
}
