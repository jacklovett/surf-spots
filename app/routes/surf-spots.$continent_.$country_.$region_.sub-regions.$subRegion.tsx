import { useEffect } from 'react'
import {
  data,
  Link,
  LoaderFunction,
  useLoaderData,
  useLocation,
  useNavigate,
} from 'react-router'
import { ContentStatus } from '~/components'
import { cacheControlHeader, get, post } from '~/services/networkService'
import { getSession } from '~/services/session.server'
import type { SurfSpot, SubRegion, SurfSpotFilters } from '~/types/surfSpots'
import { useSurfSpotsContext } from '~/contexts'

interface LoaderData {
  surfSpots: SurfSpot[]
  error?: string
  subRegionDetails?: SubRegion
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { continent, country, region, subRegion } = params
  const url = new URL(request.url)
  const searchParams = Object.fromEntries(url.searchParams.entries())

  try {
    const session = await getSession(request.headers.get('Cookie'))
    const user = session.get('user')
    const userId = user?.id

    const filters = { ...searchParams, userId }

    // Try to get sub-region details
    const subRegionDetails = await get<SubRegion>(`sub-regions/${subRegion}`)

    // Then get surf spots for this sub-region
    const surfSpots = await post<typeof filters, SurfSpot[]>(
      `surf-spots/sub-region/${subRegion}`,
      { ...filters },
    )

    return data<LoaderData>(
      { surfSpots: surfSpots ?? [], subRegionDetails },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    console.error('Error loading sub-region data:', error)

    // If sub-region doesn't exist, redirect to the surf spot route
    // This will let React Router try the surf spot route
    throw new Response('', {
      status: 302,
      headers: {
        Location: `/surf-spots/${continent}/${country}/${region}/${subRegion}`,
      },
    })
  }
}

export default function SubRegionPage() {
  const { surfSpots, subRegionDetails, error } = useLoaderData<LoaderData>()
  const { filters } = useSurfSpotsContext()
  const navigate = useNavigate()
  const location = useLocation()

  // When filters change, update the URL with new search params to trigger loader
  const serializeFiltersToSearchParams = (filters: SurfSpotFilters): string => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v) {
            params.append(key, v)
          }
        })
      } else if (value && !(Array.isArray(value) && value.length === 0)) {
        params.append(key, value)
      }
    })
    return params.toString()
  }

  // Only update the URL when filters change
  useEffect(() => {
    const queryString = serializeFiltersToSearchParams(filters)
    const currentParams = location.search.replace(/^\?/, '')
    if (queryString !== currentParams) {
      navigate(`${location.pathname}${queryString ? `?${queryString}` : ''}`)
    }
  }, [filters, location.pathname, location.search, navigate])

  if (error || !subRegionDetails) {
    return (
      <ContentStatus isError>
        <p>{error ?? "Couldn't find details for this sub-region"}</p>
      </ContentStatus>
    )
  }

  const { name, description } = subRegionDetails

  return (
    <div className="content">
      <h1>{name}</h1>
      <p className="description">{description}</p>

      <div className="surf-spots">
        <h2>Surf Spots</h2>
        <div className="list-map">
          {surfSpots.length > 0 ? (
            surfSpots.map((surfSpot) => {
              const { id, name, path } = surfSpot
              return (
                <Link key={id} to={path} prefetch="intent">
                  {name}
                </Link>
              )
            })
          ) : (
            <p>No surf spots found</p>
          )}
        </div>
      </div>
    </div>
  )
}
