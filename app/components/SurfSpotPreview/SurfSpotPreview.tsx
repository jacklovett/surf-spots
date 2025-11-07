import { memo } from 'react'

import { User } from '~/types/user'
import { SurfSpot } from '~/types/surfSpots'

import Details from '../Details'
import Rating from '../Rating'
import SurfSpotActions from '../SurfSpotActions'
import { useLayoutContext, useSettingsContext } from '~/contexts'
import { FetcherSubmitParams } from '../SurfSpotActions'
import {
  DirectionIcon,
  TideIcon,
  SurfHeightIcon,
  CalendarIcon,
} from '../ConditionIcons'
import { formatSurfHeightRange, formatSeason } from '~/utils/surfSpotUtils'

interface IProps {
  surfSpot: SurfSpot
  user: User | null
  navigate: (path: string) => void
  onFetcherSubmit?: (params: FetcherSubmitParams) => void
}

export const SurfSpotPreview = memo((props: IProps) => {
  const { surfSpot, user, navigate, onFetcherSubmit } = props

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
    seasonStart,
    seasonEnd,
    rating,
  } = surfSpot

  const { closeDrawer } = useLayoutContext()
  const { settings } = useSettingsContext()
  const { preferredUnits } = settings

  return (
    <div className="surf-spot-preview">
      <div className="surf-spot-preview-content">
        <div className="surf-spot-preview-details">
          {/* Basic Details */}
          <div className="preview-section">
            <Details label="Break Type" value={type} />
            <Details label="Beach Bottom" value={beachBottomType} />
            <Details label="Skill Level" value={skillLevel} />
            <Details label="Wave Direction" value={waveDirection} />
          </div>

          {/* Best Conditions */}
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
            <div className="condition-item">
              <CalendarIcon size={20} />
              <Details
                label="Season"
                value={formatSeason(seasonStart, seasonEnd)}
              />
            </div>
          </div>

          {/* Rating */}
          <div className="preview-section">
            <h4 className="preview-subtitle">Rating</h4>
            <Rating value={rating} readOnly />
          </div>
        </div>
        <a
          className="surf-spot-preview-link"
          onClick={() => {
            navigate(path)
            closeDrawer()
          }}
          tabIndex={0}
        >
          Learn more
        </a>
        <div className="surf-spot-preview-actions">
          <SurfSpotActions {...{ surfSpot, navigate, user, onFetcherSubmit }} />
        </div>
      </div>
    </div>
  )
})

SurfSpotPreview.displayName = 'SurfSpotPreview'
