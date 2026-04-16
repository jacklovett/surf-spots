import { useEffect, useState, useMemo } from 'react'
import {
  ActionFunction,
  Outlet,
  LoaderFunction,
  useLoaderData,
  useLocation,
  useNavigate,
  useNavigation,
  useParams,
} from 'react-router'

import {
  Breadcrumb,
  ErrorBoundary,
  Filters,
  Loading,
  SurfMap,
  Page,
  Toolbar,
  TripPlannerButton,
} from '~/components'
import {
  ERROR_BOUNDARY_SECTION,
  ERROR_BOUNDARY_MAP,
  ERROR_BOUNDARY_GENERIC,
} from '~/utils/errorUtils'
import { BreadcrumbItem } from '~/components/Breadcrumb'
import { getAppliedFiltersCount } from '~/components/Filters'
import { resolveSurfSpotActionUrl } from '~/utils/surfSpotUtils'

import { surfSpotAction } from '~/services/surfSpot.server'
import {
  useLayoutContext,
  useSurfSpotsContext,
  useUserContext,
} from '~/contexts'
import { useSurfSpotActions } from '~/hooks'

interface LoaderData {
  isMapView: boolean
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
  const navigatingTo = navigation.location?.pathname

  const isNavigating = navigation.state === 'loading'

  const loading =
  isNavigating &&
    (!navigatingTo || navigatingTo.startsWith('/surf-spots'))

  const { fetcher, onFetcherSubmit } = useSurfSpotActions(
    resolveSurfSpotActionUrl(pathname),
  )

  const { isMapView: initialMapView } = useLoaderData<LoaderData>()

  const [isMapView, setIsMapView] = useState(initialMapView)
  const handleToggleView = () =>
    navigate(isMapView ? '/surf-spots/continents/' : '/surf-spots')

  const { filters } = useSurfSpotsContext()

  const handleOpenFilters = () => {
    const filtersContent = (
      <ErrorBoundary message={ERROR_BOUNDARY_SECTION}>
        <Filters />
      </ErrorBoundary>
    )
    openDrawer(filtersContent, 'left', 'Filters')
  }

  useEffect(() => {
    setIsMapView(checkIsMapView(pathname))
  }, [pathname])

  const isMapViewTransition =
    isNavigating &&
    navigatingTo &&
    checkIsMapView(navigatingTo) !== checkIsMapView(pathname)

  const params = useParams()
  const { continent, country, region, subRegion, surfSpot } = params

  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    const breadcrumbItems: BreadcrumbItem[] = [
      { label: 'World', link: '/surf-spots/continents' },
    ]

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
  }, [continent, country, region, subRegion, surfSpot])

  const isDetailPage =
    !!surfSpot ||
    (/^\/surf-spots\/[^/]+\/[^/]+\/[^/]+\/[^/]+$/.test(pathname) &&
      !pathname.endsWith('/sub-regions') &&
      !pathname.endsWith('/continents')) ||
    /^\/surf-spots\/[^/]+\/[^/]+\/[^/]+\/sub-regions\/[^/]+\/[^/]+$/.test(
      pathname,
    )

  /** Add session lives under this layout but should match add-surf-spot: header + form only (no map toolbar or trail). */
  const isAddSessionRoute =
    pathname.startsWith('/surf-spots/') && /\/session\/?$/.test(pathname)

  const loadingComponent = (
    <div className="page-loading-state">
      <Loading />
    </div>
  )

  return (
    <Page showHeader overrideLoading>
      {!isAddSessionRoute && (
        <>
          <Toolbar
            showAddButton={!!user}
            onAddNewSpot={() => navigate('/add-surf-spot')}
            addButtonLoading={
              isNavigating &&
              navigation.location?.pathname === '/add-surf-spot'
            }
            onOpenFilters={handleOpenFilters}
            filtersBadge={getAppliedFiltersCount(filters)}
            isMapView={isMapView}
            onToggleView={handleToggleView}
            hideFilters={isDetailPage}
            hideToolbarBorder={isMapView && !loading && !isMapViewTransition}
          />
          <TripPlannerButton
            onOpenTripPlanner={() => navigate('/trip-planner')}
            isLoading={
              isNavigating &&
              navigation.location?.pathname === '/trip-planner'
            }
          />
        </>
      )}
      <div className="surf-spots-content-body column flex-1">
        {isMapView ? (
          loading || isMapViewTransition ? (
            loadingComponent
          ) : (
            <div className="center column h-full map-wrapper">
              <ErrorBoundary message={ERROR_BOUNDARY_MAP}>
                <SurfMap
                  onFetcherSubmit={onFetcherSubmit}
                  surfActionFetcher={fetcher}
                />
              </ErrorBoundary>
            </div>
          )
        ) : (
          <div className="column surf-spots-list-view flex-1">
            {!isAddSessionRoute && <Breadcrumb items={breadcrumbs} />}
            <div className="surf-spots-list-content column flex-1">
              {loading ? (
                loadingComponent
              ) : (
                <ErrorBoundary message={ERROR_BOUNDARY_GENERIC}>
                  <div className="mt">
                    <Outlet />
                  </div>
                </ErrorBoundary>
              )}
            </div>
          </div>
        )}
      </div>
    </Page>
  )
}
