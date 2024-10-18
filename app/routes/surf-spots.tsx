import { useEffect, useState } from 'react'
import {
  json,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useNavigation,
  useParams,
} from '@remix-run/react'
import {
  Breadcrumb,
  ContentStatus,
  ErrorBoundary,
  Loading,
  SurfMap,
  Page,
  ViewSwitch,
  TextButton,
} from '~/components'
import { BreadcrumbItem } from '~/components/Breadcrumb'
import { LoaderFunction } from '@remix-run/node'
import classNames from 'classnames'

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

export const loader: LoaderFunction = ({ request }) => {
  const { pathname } = new URL(request.url)
  return json({
    isMapView: checkIsMapView(pathname),
    filters: getFilters(pathname),
  })
}

export default function SurfSpots() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { state } = useNavigation()

  const loading = state === 'loading'

  const [isFiltersViewOpen, setFiltersViewOpen] = useState(false)

  // Get the initial view from the loader data
  const { isMapView: initialMapView, filters: initialFilters } =
    useLoaderData<LoaderData>()
  const [isMapView, setIsMapView] = useState(initialMapView)
  const [filters, setFilters] = useState(initialFilters)
  // Handle the toggle view logic
  const handleToggleView = () => {
    navigate(isMapView ? '/surf-spots/continents/' : '/surf-spots')
    setIsMapView(!isMapView)
  }

  // Used to check if navigation map from map view i.e. from PopUps
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

  const showFilters = filters && filters.length > 0

  return (
    <Page showHeader>
      <div
        className={classNames({
          'row toolbar': true,
          'space-between': showFilters,
          'flex-end': !showFilters,
        })}
      >
        {showFilters && (
          <TextButton
            text="Filters"
            onClick={() => setFiltersViewOpen(!isFiltersViewOpen)}
            iconKey="filters"
          />
        )}
        <ViewSwitch
          isPrimaryView={isMapView}
          onToggleView={handleToggleView}
          primaryLabel="Map"
          secondaryLabel="List"
        />
      </div>
      {isMapView ? (
        <div className="center column">
          <ErrorBoundary message="Uh-oh! Something went wrong displaying the map!">
            <SurfMap />
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
              <Outlet />
            </ErrorBoundary>
          )}
        </div>
      )}
    </Page>
  )
}
