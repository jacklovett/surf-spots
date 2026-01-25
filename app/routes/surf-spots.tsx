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
  ContentStatus,
  ErrorBoundary,
  Filters,
  Loading,
  SurfMap,
  Page,
  Toolbar,
  TripPlannerButton,
} from '~/components'
import { BreadcrumbItem } from '~/components/Breadcrumb'
import { getAppliedFiltersCount } from '~/components/Filters'

import { surfSpotAction } from '~/services/surfSpot.server'
import {
  useLayoutContext,
  useSurfSpotsContext,
  useUserContext,
} from '~/contexts'
import { useSurfSpotActions } from '~/hooks'

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
  const navigatingTo = navigation.location?.pathname
  
  // Show loading when navigating within surf-spots routes (not navigating away)
  const loading = 
    navigation.state === 'loading' && 
    (!navigatingTo || navigatingTo.startsWith('/surf-spots'))

  // Determine the correct action route based on current pathname
  // If we're on a detail page (child route), submit to that route
  // Otherwise submit to the parent /surf-spots route
  const actionRoute =
    pathname.startsWith('/surf-spots/') &&
    pathname !== '/surf-spots' &&
    pathname !== '/surf-spots/'
      ? pathname
      : '/surf-spots'

  const { onFetcherSubmit } = useSurfSpotActions(actionRoute)

  // Get the initial view from the loader data
  const { isMapView: initialMapView } = useLoaderData<LoaderData>()

  const [isMapView, setIsMapView] = useState(initialMapView)
  // Handle the toggle view logic
  const handleToggleView = () => navigate(isMapView ? '/surf-spots/continents/' : '/surf-spots')

  const { filters } = useSurfSpotsContext()

  const handleOpenFilters = () => {
    const filtersContent = (
      <ErrorBoundary message="Unable to display filters">
        <Filters />
      </ErrorBoundary>
    )
    openDrawer(filtersContent, 'left', 'Filters')
  }

  // Update isMapView when pathname changes
  useEffect(() => {
    setIsMapView(checkIsMapView(pathname))
  }, [pathname])

  // Prevent map from rendering during transition to/from map view
  const isMapViewTransition = 
    navigation.state === 'loading' &&
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
  // Detect detail pages - check if pathname matches detail page route patterns
  // Pattern 1: /surf-spots/{continent}/{country}/{region}/{surfSpot} (excludes ending in 'sub-regions' or 'continents')
  // Pattern 2: /surf-spots/{continent}/{country}/{region}/sub-regions/{subRegion}/{surfSpot}
  const isDetailPage =
    !!surfSpot ||
    (/^\/surf-spots\/[^/]+\/[^/]+\/[^/]+\/[^/]+$/.test(pathname) &&
      !pathname.endsWith('/sub-regions') &&
      !pathname.endsWith('/continents')) ||
    /^\/surf-spots\/[^/]+\/[^/]+\/[^/]+\/sub-regions\/[^/]+\/[^/]+$/.test(
      pathname,
    )

  const loadingComponent = (
    <ContentStatus>
      <Loading />
    </ContentStatus>
  )

  return (
    <Page showHeader overrideLoading>
      <Toolbar
        showAddButton={!!user}
        onAddNewSpot={() => navigate('/add-surf-spot')}
        onOpenFilters={handleOpenFilters}
        filtersBadge={getAppliedFiltersCount(filters)}
        isMapView={isMapView}
        onToggleView={handleToggleView}
        hideFilters={isDetailPage}
      />
      <TripPlannerButton onOpenTripPlanner={() => navigate('/trip-planner')} />
      {isMapView ? (
        loading || isMapViewTransition ? (
          loadingComponent
        ) : (
          <div className="center column h-full map-wrapper">
            <ErrorBoundary message="Uh-oh! Something went wrong displaying the map!">
              <SurfMap onFetcherSubmit={onFetcherSubmit} />
            </ErrorBoundary>
          </div>
        )
      ) : (
        <div className="column surf-spots-list-view">
          <Breadcrumb items={breadcrumbs} />
          {loading ? (
            loadingComponent
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
