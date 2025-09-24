import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { MapMouseEvent } from 'mapbox-gl'

import { useLayoutContext, useUserContext } from '~/contexts'
import { SurfSpot } from '~/types/surfSpots'
import { SurfSpotPreview } from '~/components'
import { FetcherSubmitParams } from '~/components/SurfSpotActions'
export const useMapDrawer = (
  onFetcherSubmit?: (params: FetcherSubmitParams) => void,
) => {
  const navigate = useNavigate()
  const { user } = useUserContext()
  const { openDrawer } = useLayoutContext()

  const handleMarkerClick = useCallback(
    (event: MapMouseEvent) => {
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
          <SurfSpotPreview
            surfSpot={surfSpot}
            user={user}
            navigate={navigate}
            onFetcherSubmit={onFetcherSubmit}
          />
        )

        openDrawer(drawerContent, 'right', surfSpot.name)
      } catch (error) {
        console.error('Error handling marker click:', error)
      }
    },
    [user, navigate, openDrawer, onFetcherSubmit],
  )

  return { handleMarkerClick }
}
