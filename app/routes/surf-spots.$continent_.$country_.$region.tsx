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

  const session = await getSession(request.headers.get('Cookie'))
  const user = session.get('user')
  const userId = user?.id

  const filters = { ...searchParams, userId }
  const surfSpots = await post<typeof filters, SurfSpot[]>(
    `surf-spots/region/${region}`,
    { ...filters },
  )

  const regionDetails = await get<Region>(`regions/${region}`)

  return data<LoaderData>(
    { surfSpots: surfSpots ?? [], regionDetails },
    {
      headers: cacheControlHeader,
    },
  )
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

  const { name, description } = regionDetails

  return (
    <div className="content">
      <h1>{name}</h1>
      <p className="description">{description}</p>
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
  )
}
