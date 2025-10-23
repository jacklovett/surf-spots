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
import type { SurfSpot, Region, SurfSpotFilters } from '~/types/surfSpots'
import { useSurfSpotsContext } from '~/contexts'

interface LoaderData {
  surfSpots: SurfSpot[]
  error?: string
  regionDetails?: Region
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { region } = params
  const url = new URL(request.url)
  const searchParams = Object.fromEntries(url.searchParams.entries())

  try {
    const session = await getSession(request.headers.get('Cookie'))
    const user = session.get('user')
    const userId = user?.id

    const filters = { ...searchParams, userId }

    // Try to get region details first
    const regionDetails = await get<Region>(`regions/${region}`)

    // Then get surf spots for this region
    const surfSpots = await post<typeof filters, SurfSpot[]>(
      `surf-spots/region/${region}`,
      { ...filters },
    )

    return data<LoaderData>(
      { surfSpots: surfSpots ?? [], regionDetails },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    console.error('Error loading region data:', error)
    return data<LoaderData>(
      {
        surfSpots: [],
        regionDetails: undefined,
        error: 'Failed to load region data. Please try again later.',
      },
      {
        status: 404,
      },
    )
  }
}

export default function Region() {
  const { surfSpots, regionDetails, error } = useLoaderData<LoaderData>()
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

  if (error || !regionDetails) {
    return (
      <ContentStatus isError>
        <p>{error ?? "Couldn't find details for this region"}</p>
      </ContentStatus>
    )
  }

  const { name, description, subRegions } = regionDetails

  return (
    <div className="content mb-l">
      <h1>{name}</h1>
      <p className="description">{description}</p>

      {/* Show sub-regions if they exist */}
      {subRegions && subRegions.length > 0 && (
        <div className="sub-regions">
          <h2>Sub-Regions</h2>
          <div className="list-map">
            {subRegions.map((subRegion) => {
              const { id, name, slug } = subRegion
              return (
                <Link
                  key={id}
                  to={`${location.pathname}/sub-regions/${slug}`}
                  prefetch="intent"
                >
                  {name}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Show surf spots that are directly in this region (not in sub-regions) */}
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
