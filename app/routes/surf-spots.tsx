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
} from '~/components'
import { BreadcrumbItem } from '~/components/Breadcrumb'
import { LoaderFunction } from '@remix-run/node'

interface LoaderData {
  isMapView: boolean
}

export const loader: LoaderFunction = ({ request }) => {
  const { pathname } = new URL(request.url)
  // Determine if we're on the map view
  const isMapView = pathname === '/surf-spots' || pathname === '/surf-spots/'
  return json({ isMapView })
}

export default function SurfSpots() {
  const navigate = useNavigate()
  const { state } = useNavigation()
  const loading = state === 'loading'

  // Get the initial view from the loader data
  const { isMapView: initialMapView } = useLoaderData<LoaderData>()

  // Manage isMapView in local state
  const [isMapView, setIsMapView] = useState(initialMapView)

  // Handle the toggle view logic
  const handleToggleView = () => {
    if (isMapView) {
      navigate('/surf-spots/continents/')
    } else {
      navigate('/surf-spots')
    }
    setIsMapView(!isMapView)
  }

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
    <Page showHeader>
      <div className="row space-between toolbar">
        <h3>Surf Spots</h3>
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
            <SurfMap surfSpots={[]} />
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
