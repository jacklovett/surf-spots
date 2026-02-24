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
import { ERROR_LOAD_REGION_DATA } from '~/utils/errorUtils'

interface LoaderData {
  surfSpots: SurfSpot[]
  error?: string
  regionDetails?: Region
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { country, region } = params
  const url = new URL(request.url)
  const searchParams = Object.fromEntries(url.searchParams.entries())

  if (!country || !region) {
    return data<LoaderData>(
      { surfSpots: [], regionDetails: undefined, error: 'Missing country or region in URL.' },
      { status: 404 },
    )
  }

  try {
    const session = await getSession(request.headers.get('Cookie'))
    const user = session.get('user')
    const userId = user?.id

    const filters = { ...searchParams, userId }

    // Get region by country + region slug so we get the correct region (e.g. England's South West, not Italy's)
    const regionDetails = await get<Region>(`regions/country/${country}/${region}`)

    // Get surf spots by region id; if this fails we still show region name and description
    let surfSpots: SurfSpot[] = []
    try {
      surfSpots = await post<typeof filters, SurfSpot[]>(
        `surf-spots/region-id/${regionDetails.id}`,
        { ...filters },
      ) ?? []
    } catch (spotsError) {
      console.error('Error loading surf spots for region:', spotsError)
    }

    return data<LoaderData>(
      { surfSpots, regionDetails },
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
        error: ERROR_LOAD_REGION_DATA,
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
      {(description != null && description !== '') && <p className="description">{description}</p>}

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
