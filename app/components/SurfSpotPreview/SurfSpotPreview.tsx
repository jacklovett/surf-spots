import { memo } from 'react'

import { User } from '~/types/user'
import { SurfSpot } from '~/types/surfSpots'

import Details from '../Details'
import Chip from '../Chip'
import { useLayoutContext, useSettingsContext, useToastContext } from '~/contexts'
import { SurfSpotQuickActionSubmitHandler } from '~/types/api'
import {
  DirectionIcon,
  TideIcon,
  SurfHeightIcon,
  CalendarIcon,
} from '../ConditionIcons'
import { formatSurfHeightRange, formatSeason, getNoveltyWaveLabel } from '~/utils/surfSpotUtils'
import { ERROR_OPEN_SURF_SPOT } from '~/utils/errorUtils'

interface IProps {
  surfSpot: SurfSpot
  user: User | null
  navigate: (path: string) => void
  onFetcherSubmit?: SurfSpotQuickActionSubmitHandler
}

export const SurfSpotPreview = memo((props: IProps) => {
  const { surfSpot, navigate } = props

  const {
    beachBottomType,
    skillLevel,
    path,
    type,
    waveDirection,
    swellDirection,
    windDirection,
    tide,
    minSurfHeight,
    maxSurfHeight,
    swellSeason,
    isWavepool,
    isRiverWave,
  } = surfSpot

  const isNoveltyWave = isWavepool || isRiverWave
  const noveltyLabel = getNoveltyWaveLabel({ isWavepool, isRiverWave })
  const { closeDrawer } = useLayoutContext()
  const { settings } = useSettingsContext()
  const { showError } = useToastContext()
  const { preferredUnits } = settings

  return (
    <div className="surf-spot-preview">
      <div className="surf-spot-preview-content">
        {noveltyLabel && (
          <div className="surf-spot-preview-novelty">
            <Chip label={noveltyLabel} isFilled={false} />
          </div>
        )}
        <div className="surf-spot-preview-details">
          {/* Basic Details */}
          <div className="preview-section">
            <Details label="Break Type" value={type} />
            <Details label="Beach Bottom" value={beachBottomType} />
            <Details label="Skill Level" value={skillLevel} />
            <Details label="Wave Direction" value={waveDirection} />
          </div>

          {/* Best Conditions – swell/wind/tide/height for ocean only */}
          {!isNoveltyWave && (
            <div className="preview-section">
              <h4 className="preview-subtitle">Best Conditions</h4>
              <div className="condition-item">
                <DirectionIcon
                  type="swell"
                  directionRange={swellDirection}
                  size={20}
                />
                <Details label="Swell Direction" value={swellDirection} />
              </div>
              <div className="condition-item">
                <DirectionIcon
                  type="wind"
                  directionRange={windDirection}
                  size={20}
                />
                <Details label="Wind Direction" value={windDirection} />
              </div>
              <div className="condition-item">
                <TideIcon tide={tide} size={20} />
                <Details label="Tides" value={tide} />
              </div>
              <div className="condition-item">
                <SurfHeightIcon size={20} />
                <Details
                  label="Surf Height"
                  value={formatSurfHeightRange(
                    preferredUnits,
                    minSurfHeight,
                    maxSurfHeight,
                  )}
                />
              </div>
            </div>
          )}

          {/* Season – for all spots when available */}
          {swellSeason && (
            <div className="preview-section">
              <h4 className="preview-subtitle">Season</h4>
              <div className="condition-item">
                <CalendarIcon size={20} />
                <Details label="Season" value={formatSeason(swellSeason)} />
              </div>
            </div>
          )}

        </div>
        <a
          className="surf-spot-preview-link"
          onClick={() => {
            if (!path || path.trim() === '') {
              showError(ERROR_OPEN_SURF_SPOT)
              return
            }
            navigate(path)
            closeDrawer()
          }}
          tabIndex={0}
        >
          Learn more
        </a>
      </div>
    </div>
  )
})

SurfSpotPreview.displayName = 'SurfSpotPreview'
