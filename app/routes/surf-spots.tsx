import { useEffect, useState, useCallback } from 'react'
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
  TripPlannerButton,
} from '~/components'
import { submitFetcher } from '~/components/SurfSpotActions'
import { FetcherSubmitParams } from '~/components/SurfSpotActions'
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
  const navigation = useNavigation()
  const { state } = navigation

  // Check if we're navigating away from this route (to a different route)
  // navigation.location is the location being navigated to (if navigation is in progress)
  const navigatingTo = navigation.location?.pathname
  const isNavigatingAway =
    state === 'loading' && !navigatingTo?.startsWith('/surf-spots')
  const loading = state === 'loading' && !isNavigatingAway

  const fetcher = useFetcher()

  const onFetcherSubmit = useCallback(
    (params: FetcherSubmitParams) => submitFetcher(params, fetcher),
    [fetcher],
  )

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

  // Update isMapView when pathname changes, but don't redirect
  useEffect(() => {
    const newIsMapView = checkIsMapView(pathname)
    setIsMapView(newIsMapView)
  }, [pathname])

  const generateBreadcrumbItems = (): BreadcrumbItem[] => {
    const breadcrumbItems: BreadcrumbItem[] = [
      { label: 'World', link: '/surf-spots/continents' },
    ]
    const { continent, country, region, subRegion, surfSpot } = useParams()

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
    subRegion &&
      breadcrumbItems.push({
        label: subRegion,
        link: `/surf-spots/${continent}/${country}/${region}/sub-regions/${subRegion}`,
      })
    surfSpot &&
      breadcrumbItems.push({
        label: surfSpot,
        link: subRegion
          ? `/surf-spots/${continent}/${country}/${region}/sub-regions/${subRegion}/${surfSpot}`
          : `/surf-spots/${continent}/${country}/${region}/${surfSpot}`,
      })

    return breadcrumbItems
  }

  const breadcrumbs = generateBreadcrumbItems()

  return (
    <Page showHeader overrideLoading={loading}>
      <Toolbar
        showAddButton={!!user}
        onAddNewSpot={() => navigate('/add-surf-spot')}
        onOpenFilters={handleOpenFilters}
        filtersBadge={getAppliedFiltersCount(filters)}
        isMapView={isMapView}
        onToggleView={handleToggleView}
        hideFilters={!!useParams().surfSpot} // Hide filters when on surf spot details page
      />
      <TripPlannerButton onOpenTripPlanner={() => navigate('/trip-planner')} />
      {isMapView ? (
        <div className="center column h-full map-wrapper">
          <ErrorBoundary message="Uh-oh! Something went wrong displaying the map!">
            <SurfMap onFetcherSubmit={onFetcherSubmit} />
          </ErrorBoundary>
        </div>
      ) : (
        <div className="column">
          <Breadcrumb items={breadcrumbs} />
          {loading ? (
            <ContentStatus>
              <Loading />
            </ContentStatus>
          ) : (
            <ErrorBoundary message="Uh-oh! Something went wrong!">
              <div className="mt">
                <Outlet />
              </div>
            </ErrorBoundary>
          )}
        </div>
      )}
    </Page>
  )
}
