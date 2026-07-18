import { EndSessionSpotViewModel } from '~/hooks/useEndSessionSpotResolution'
import { useEndSessionSpotPreviewDrawer } from '~/hooks/useEndSessionSpotPreviewDrawer'

import { ContentStatus, ErrorRecoveryActions, Icon, Loading } from '~/components'
import EndSessionSpotMap from './EndSessionSpotMap'

interface EndSessionSpotSectionProps {
  spotResolution: EndSessionSpotViewModel
}

const formatSpotPickerStatus = (nearbySpotCount: number): string => {
  if (nearbySpotCount === 0) {
    return 'No listed spots near where you started. You can still save without one.'
  }

  if (nearbySpotCount === 1) {
    return '1 spot near where you started. Choose it on the map or in the list to confirm.'
  }

  return `${nearbySpotCount} spots near where you started. Choose one on the map or in the list to confirm.`
}

export const EndSessionSpotSection = ({ spotResolution }: EndSessionSpotSectionProps) => {
  const {
    status,
    selectedSpotName,
    isUnknownLocation,
    nearbySpots,
    selectedSpotId,
    sessionCoordinates,
    confirmSpotSelection,
    clearSpotSelection,
    formatSpotOptionLabel,
    retryNearbySpots,
  } = spotResolution

  const { openSpotPreview } = useEndSessionSpotPreviewDrawer({
    selectedSpotId,
    onConfirmSpot: confirmSpotSelection,
    onClearSpot: clearSpotSelection,
  })

  if (status === 'loading') {
    return (
      <ContentStatus>
        <Loading />
      </ContentStatus>
    )
  }

  if (status === 'error') {
    return (
      <ContentStatus
        isError
        actions={<ErrorRecoveryActions onRetry={retryNearbySpots} />}
      >
        <p>
          Could not load nearby spots. You can still save this session without linking
          a spot.
        </p>
      </ContentStatus>
    )
  }

  if (status === 'no-coordinates') {
    return (
      <ContentStatus>
        <p>No starting location was recorded for this session.</p>
      </ContentStatus>
    )
  }

  if (sessionCoordinates == null) {
    return null
  }

  return (
    <div className="end-session-spot-section">
      <div className="end-session-spot-header ph">
        <h2 className="m-0 mb">Where did you surf?</h2>
        <p className="font-small text-secondary m-0" aria-live="polite">
          {isUnknownLocation ? (
            formatSpotPickerStatus(nearbySpots.length)
          ) : (
            <>
              Selected: <span className="bold">{selectedSpotName}</span>
            </>
          )}
        </p>
      </div>

      <EndSessionSpotMap
        sessionCoordinates={sessionCoordinates}
        nearbySpots={nearbySpots}
        selectedSpotId={selectedSpotId}
        onOpenSpotPreview={openSpotPreview}
      />

      {nearbySpots.length > 0 && (
        <div className="end-session-spot-list-panel ph">
          <p className="font-small bold m-0">Nearby spots</p>
          <ul className="end-session-spot-list" aria-label="Nearby spots">
            {nearbySpots.map((spot) => {
              if (spot.id == null) {
                return null
              }

              const spotId = String(spot.id)
              const isSelected = selectedSpotId === spotId

              return (
                <li key={spotId}>
                  <button
                    type="button"
                    className={`end-session-spot-list-button${isSelected ? ' end-session-spot-list-button-selected' : ''}`}
                    aria-pressed={isSelected}
                    onClick={() => openSpotPreview(spot)}
                  >
                    {formatSpotOptionLabel(spot)}
                    {isSelected && (
                      <span className="end-session-spot-list-selected-badge">
                        <Icon iconKey="success" useCurrentColor />
                        <span className="font-small bold">Selected</span>
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export default EndSessionSpotSection
