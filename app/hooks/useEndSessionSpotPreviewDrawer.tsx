import { useCallback } from 'react'
import { useNavigate } from 'react-router'

import ErrorBoundary from '~/components/ErrorBoundary'
import SurfSpotPreview from '~/components/SurfSpotPreview'
import EndSessionSpotConfirmButton from '~/components/EndSessionSpotSection/EndSessionSpotConfirmButton'

import { useLayoutContext, useUserContext } from '~/contexts'
import {
  formatSessionSpotDistanceLabel,
  NearbySurfSpot,
} from '~/utils/nearbySurfSpots'
import { ERROR_BOUNDARY_SECTION } from '~/utils/errorUtils'

interface UseEndSessionSpotPreviewDrawerParams {
  selectedSpotId: string
  onConfirmSpot: (spotId: string) => void
  onClearSpot: () => void
}

export const useEndSessionSpotPreviewDrawer = ({
  selectedSpotId,
  onConfirmSpot,
  onClearSpot,
}: UseEndSessionSpotPreviewDrawerParams) => {
  const navigate = useNavigate()
  const { user } = useUserContext()
  const { openDrawer } = useLayoutContext()

  const openSpotPreview = useCallback(
    (spot: NearbySurfSpot) => {
      if (spot.id == null) {
        return
      }

      const spotId = String(spot.id)
      const spotName = spot.name ?? 'Surf spot'
      const isSelectedForSession = selectedSpotId !== '' && selectedSpotId === spotId

      const drawerContent = (
        <div className="end-session-spot-drawer">
          <div className="end-session-spot-drawer-body">
            <ErrorBoundary message={ERROR_BOUNDARY_SECTION}>
              <SurfSpotPreview
                surfSpot={spot}
                user={user}
                navigate={navigate}
                sessionDistanceLabel={formatSessionSpotDistanceLabel(spot.distanceKm)}
              />
            </ErrorBoundary>
          </div>
          <EndSessionSpotConfirmButton
            spotId={spotId}
            spotName={spotName}
            isSelectedForSession={isSelectedForSession}
            onConfirmSpot={onConfirmSpot}
            onClearSpot={onClearSpot}
          />
        </div>
      )

      openDrawer(drawerContent, 'right', spotName)
    },
    [navigate, onClearSpot, onConfirmSpot, openDrawer, selectedSpotId, user],
  )

  return { openSpotPreview }
}
