import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { MapMouseEvent } from 'mapbox-gl'

import { useLayoutContext, useUserContext, useSurfSpotsContext } from '~/contexts'
import { SurfSpot } from '~/types/surfSpots'
import { FetcherWithComponents } from 'react-router'

import { ErrorBoundary, SurfSpotPreview, SurfSpotActions } from '~/components'
import { ERROR_BOUNDARY_SECTION } from '~/utils/errorUtils'
import { ActionData, SurfSpotQuickActionSubmitHandler } from '~/types/api'

/**
 * Opens the surf-spot preview drawer from a Mapbox marker/feature click.
 */
export const useSurfSpotDrawer = (
  onFetcherSubmit?: SurfSpotQuickActionSubmitHandler,
  surfActionFetcher?: FetcherWithComponents<ActionData>,
) => {
  const navigate = useNavigate()
  const { user } = useUserContext()
  const { openDrawer } = useLayoutContext()
  const { mergeSurfSpots } = useSurfSpotsContext()

  const openSurfSpotDrawer = useCallback(
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

        // Keep the spot in context so updateSurfSpot (called on confirmed action)
        // can update map markers and other context consumers.
        mergeSurfSpots([surfSpot])

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
          />
        )

        openDrawer(drawerContent, 'right', surfSpot.name, drawerActions)
      } catch (error) {
        console.error('Error opening surf spot drawer:', error)
      }
    },
    [user, navigate, openDrawer, onFetcherSubmit, surfActionFetcher, mergeSurfSpots],
  )

  return { openSurfSpotDrawer }
}
