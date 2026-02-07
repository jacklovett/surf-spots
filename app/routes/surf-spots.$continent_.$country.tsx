import { data, Link, useLoaderData, useParams } from 'react-router'
import { ContentStatus, Icon } from '~/components'
import { cacheControlHeader, get } from '~/services/networkService'
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

    return data<LoaderData>(
      { regions: regions ?? [], countryDetails },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    console.error('Error fetching regions: ', error)
    return data<LoaderData>(
      {
        regions: [],
        error: `We can't seem to locate the regions. Please try again later.`,
      },
      {
        status: 500,
      },
    )
  }
}

export default function Country() {
  const { continent, country } = useParams()

  const { regions = [], countryDetails, error } = useLoaderData<LoaderData>()

  if (error || !countryDetails) {
    return (
      <ContentStatus isError>
        <p>{error ?? "Couldn't find details for this country"}</p>
      </ContentStatus>
    )
  }

  const { name, description, emergencyNumbers } = countryDetails

  return (
    <div className="content mb-l">
      <h1>{name}</h1>
      <p className="description">{description}</p>
      <div className="list-map">
        {regions.length > 0 ? (
          regions.map((region) => {
            const { id, name, slug } = region
            return (
              <Link
                key={id}
                to={`/surf-spots/${continent}/${country}/${slug}`}
                prefetch="intent"
              >
                {name}
              </Link>
            )
          })
        ) : (
          <p>No regions found</p>
        )}
      </div>
      {emergencyNumbers && emergencyNumbers.length > 0 && (
        <section className="country-emergency-section">
          <h3 className="country-emergency-title">
            <span className="country-emergency-title-icon" aria-hidden>
              <Icon iconKey="phone" />
            </span>
            Emergency numbers
          </h3>
          <ul className="country-emergency-list">
            {emergencyNumbers.map((item) => (
              <li key={`${item.label}-${item.number}`}>
                <span className="country-emergency-label">{item.label}</span>
                <a href={`tel:${item.number.replace(/\s/g, '')}`} className="country-emergency-link">
                  {item.number}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
