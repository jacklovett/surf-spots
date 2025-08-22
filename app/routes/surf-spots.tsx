import { useEffect, useState } from 'react'
import {
  ActionFunction,
  Outlet,
  LoaderFunction,
  useLoaderData,
  useLocation,
  useNavigate,
  useNavigation,
  useParams,
  useFetcher,
} from 'react-router'

import {
  Breadcrumb,
  ContentStatus,
  ErrorBoundary,
  Filters,
  Loading,
  SurfMap,
  Page,
  Toolbar,
} from '~/components'
import { submitFetcher } from '~/components/SurfSpotActions'
import {
  FetcherSubmitParams,
  SurfSpotActionFetcherResponse,
} from '~/components/SurfSpotActions'
import { BreadcrumbItem } from '~/components/Breadcrumb'
import { getAppliedFiltersCount } from '~/components/Filters'

import { surfSpotAction } from '~/services/surfSpot.server'
import {
  useLayoutContext,
  useSurfSpotsContext,
  useUserContext,
} from '~/contexts'

interface LoaderData {
  isMapView: boolean
  filters: { label: string }[]
}

const checkIsMapView = (pathname: string) =>
  pathname === '/surf-spots' || pathname === '/surf-spots/'

export const loader: LoaderFunction = async ({ request }) => {
  const { pathname } = new URL(request.url)
  return {
    isMapView: checkIsMapView(pathname),
  }
}

export const action: ActionFunction = surfSpotAction

export default function SurfSpots() {
  const { user } = useUserContext()
  const { openDrawer } = useLayoutContext()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { state } = useNavigation()

  const loading = state === 'loading'

  const fetcher = useFetcher<SurfSpotActionFetcherResponse>()

  const onFetcherSubmit = (params: FetcherSubmitParams) =>
    submitFetcher(params, fetcher)

  // Get the initial view from the loader data
  const { isMapView: initialMapView } = useLoaderData<LoaderData>()

  const [isMapView, setIsMapView] = useState(initialMapView)
  // Handle the toggle view logic
  const handleToggleView = () => {
    navigate(isMapView ? '/surf-spots/continents/' : '/surf-spots')
    setIsMapView(!isMapView)
  }

  const { filters } = useSurfSpotsContext()

  const handleOpenFilters = () => {
    const filtersContent = <Filters />
    openDrawer(filtersContent, 'left', 'Filters')
  }

  useEffect(() => {
    setIsMapView(checkIsMapView(pathname))
  }, [pathname])

  const generateBreadcrumbItems = (): BreadcrumbItem[] => {
    const breadcrumbItems: BreadcrumbItem[] = [
      { label: 'World', link: '/surf-spots/continents' },
    ]
    const { continent, country, region, surfSpot } = useParams()

    continent &&
      breadcrumbItems.push({
        label: continent,
        link: `/surf-spots/${continent}`,
      })
    country &&
      breadcrumbItems.push({
        label: country,
        link: `/surf-spots/${continent}/${country}`,
      })
    region &&
      breadcrumbItems.push({
        label: region,
        link: `/surf-spots/${continent}/${country}/${region}`,
      })
    surfSpot &&
      breadcrumbItems.push({
        label: surfSpot,
        link: `/surf-spots/${continent}/${country}/${region}/${surfSpot}`,
      })

    return breadcrumbItems
  }

  const breadcrumbs = generateBreadcrumbItems()

  return (
    <Page showHeader overrideLoading>
      <Toolbar
        showAddButton={!!user}
        onAddNewSpot={() => navigate('/add-surf-spot')}
        onOpenFilters={handleOpenFilters}
        filtersBadge={getAppliedFiltersCount(filters)}
        isMapView={isMapView}
        onToggleView={handleToggleView}
      />
      {isMapView ? (
        <div className="center column h-full map-wrapper">
          <ErrorBoundary message="Uh-oh! Something went wrong displaying the map!">
            <div className="map-container">
              <SurfMap onFetcherSubmit={onFetcherSubmit} />
            </div>
          </ErrorBoundary>
        </div>
      ) : (
        <div className="column h-full">
          <Breadcrumb items={breadcrumbs} />
          {loading ? (
            <ContentStatus>
              <Loading />
            </ContentStatus>
          ) : (
            <ErrorBoundary message="Uh-oh! Something went wrong!">
              <Outlet />
            </ErrorBoundary>
          )}
        </div>
      )}
    </Page>
  )
}
