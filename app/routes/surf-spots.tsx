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
} from 'react-router'

import {
  Breadcrumb,
  ContentStatus,
  ErrorBoundary,
  Filters,
  Loading,
  SurfMap,
  Page,
  ViewSwitch,
  TextButton,
} from '~/components'
import { BreadcrumbItem } from '~/components/Breadcrumb'
import { surfSpotAction } from '~/services/surfSpot.server'
import { useUser, useLayout } from '~/contexts'

interface LoaderData {
  isMapView: boolean
  filters: { label: string }[]
}

const checkIsMapView = (pathname: string) =>
  pathname === '/surf-spots' || pathname === '/surf-spots/'

/**
 * Determine if and what filters to display - TODO
 * @param pathname
 * @returns filters - array of filters that can be applied
 */
const getFilters = (pathname: string) => {
  const isMapView = checkIsMapView(pathname)
  const filters: { label: string }[] = []

  if (isMapView) {
    filters.push({ label: 'Break Type' })
  }

  return filters
}

export const loader: LoaderFunction = async ({ request }) => {
  const { pathname } = new URL(request.url)
  return {
    isMapView: checkIsMapView(pathname),
    filters: getFilters(pathname),
  }
}

export const action: ActionFunction = surfSpotAction

export default function SurfSpots() {
  const { user } = useUser()
  const { openDrawer } = useLayout()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { state } = useNavigation()

  const loading = state === 'loading'

  // Get the initial view from the loader data
  const { isMapView: initialMapView, filters: initialFilters } =
    useLoaderData<LoaderData>()

  const [isMapView, setIsMapView] = useState(initialMapView)
  // Handle the toggle view logic
  const handleToggleView = () => {
    navigate(isMapView ? '/surf-spots/continents/' : '/surf-spots')
    setIsMapView(!isMapView)
  }

  const [filters, setFilters] = useState(initialFilters)

  const showFilters = filters && filters?.length > 0

  const handleOpenFilters = () => {
    const filtersContent = (
      <Filters
        onApplyFilters={(appliedFilters) => {
          console.log('Applied filters:', appliedFilters)
          // TODO: Apply filters to surf spots
          // Should this be filtering in frontend or calling backend?
        }}
      />
    )
    openDrawer(filtersContent, 'left', 'Filters')
  }

  useEffect(() => {
    setIsMapView(checkIsMapView(pathname))
    setFilters(getFilters(pathname))
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
      <div className="row toolbar flex-end space-between">
        <div className="row flex-1 mh-s">
          {user && (
            <TextButton
              text="Add new spot"
              onClick={() => navigate('/add-surf-spot')}
              iconKey="plus"
              filled
            />
          )}
          {showFilters && (
            <TextButton
              text="Filters"
              onClick={handleOpenFilters}
              iconKey="filters"
            />
          )}
        </div>
        <ViewSwitch
          isPrimaryView={isMapView}
          onToggleView={handleToggleView}
          primaryLabel="Map"
          secondaryLabel="List"
        />
      </div>
      {isMapView ? (
        <div className="center column h-full">
          <ErrorBoundary message="Uh-oh! Something went wrong displaying the map!">
            <SurfMap />
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
