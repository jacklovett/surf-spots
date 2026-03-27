import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { MapMouseEvent } from 'mapbox-gl'

import { useLayoutContext, useUserContext } from '~/contexts'
import { SurfSpot } from '~/types/surfSpots'
import { FetcherWithComponents } from 'react-router'

import { ErrorBoundary, SurfSpotPreview, SurfSpotActions } from '~/components'
import { ERROR_BOUNDARY_SECTION } from '~/utils/errorUtils'
import { ActionData, FetcherSubmitParams } from '~/types/api'
import { Surfboard } from '~/types/surfboard'

export const useMapDrawer = (
  onFetcherSubmit?: (params: FetcherSubmitParams) => void,
  surfActionFetcher?: FetcherWithComponents<ActionData>,
  surfboards?: Surfboard[],
) => {
  const navigate = useNavigate()
  const { user } = useUserContext()
  const { openDrawer } = useLayoutContext()

  const handleMarkerClick = useCallback(
    (event: MapMouseEvent) => {
      if (event.originalEvent) {
        event.originalEvent.stopPropagation()
      }

      try {
        const features = event.features
        if (!features || !features[0].properties) {
          throw new Error('No features or properties found on marker.')
        }

        const surfSpot: SurfSpot = JSON.parse(features[0].properties.surfSpot)
        if (!surfSpot) {
          throw new Error('No surf spot data found.')
        }

        // Open drawer with surf spot content
        const drawerContent = (
          <ErrorBoundary message={ERROR_BOUNDARY_SECTION}>
            <SurfSpotPreview
              surfSpot={surfSpot}
              user={user}
              navigate={navigate}
              onFetcherSubmit={onFetcherSubmit}
            />
          </ErrorBoundary>
        )

        const drawerActions = (
          <SurfSpotActions
            surfSpot={surfSpot}
            user={user}
            navigate={navigate}
            onFetcherSubmit={onFetcherSubmit}
            surfActionFetcher={surfActionFetcher}
            surfboards={surfboards}
          />
        )

        openDrawer(drawerContent, 'right', surfSpot.name, drawerActions)
      } catch (error) {
        console.error('Error handling marker click:', error)
      }
    },
    [user, navigate, openDrawer, onFetcherSubmit, surfActionFetcher, surfboards],
  )

  return { handleMarkerClick }
}
