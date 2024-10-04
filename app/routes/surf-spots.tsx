import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate, useParams } from '@remix-run/react'
import { Breadcrumb, Button, Page } from '~/components'
import { BreadcrumbItem } from '~/components/Breadcrumb'

export default function SurfSpots() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [isListView, setIsListView] = useState<boolean>(false)

  useEffect(() => {
    if (pathname === '/surf-spots') {
      setIsListView(false)
    }
  }, [pathname])

  const generateBreadcrumbItems = (): BreadcrumbItem[] => {
    const breadcrumbItems: BreadcrumbItem[] = [
      { label: 'World', link: '/surf-spots/continents' },
    ]
    const { continent, country, region, surfSpot } = useParams()

    if (continent) {
      breadcrumbItems.push({
        label: continent,
        link: `/surf-spots/${continent}`,
      })
    }

    if (country) {
      breadcrumbItems.push({
        label: country,
        link: `/surf-spots/${continent}/${country}`,
      })
    }

    if (region) {
      breadcrumbItems.push({
        label: region,
        link: `/surf-spots/${continent}/${country}/${region}`,
      })
    }

    if (surfSpot) {
      breadcrumbItems.push({
        label: surfSpot,
        link: `/surf-spots/${continent}/${country}/${region}/${surfSpot}`,
      })
    }

    return breadcrumbItems
  }

  const breadcrumbs = generateBreadcrumbItems()

  return (
    <Page showHeader>
      <div className="row space-between center-vertical">
        <h3>Surf Spots</h3>
        {isListView && (
          <Button
            label="See Map"
            onClick={() => {
              setIsListView(false)
              navigate('/surf-spots')
            }}
          />
        )}
        {!isListView && (
          <Button
            label="Find surf spots"
            onClick={() => {
              setIsListView(true)
              navigate('/surf-spots/continents/')
            }}
          />
        )}
      </div>
      <section>
        {!isListView && (
          <div className="center column">
            <p>Map view</p>
          </div>
        )}
        {isListView && (
          <div className="column">
            <Breadcrumb items={breadcrumbs} />
            <Outlet />
          </div>
        )}
      </section>
    </Page>
  )
}
