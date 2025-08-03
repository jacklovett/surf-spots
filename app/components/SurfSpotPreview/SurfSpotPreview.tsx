import { memo } from 'react'

import { User } from '~/types/user'
import { SurfSpot } from '~/types/surfSpots'

import { Details, SurfSpotActions } from '../index'
import { FetcherSubmitParams } from '../SurfSpotActions'

interface IProps {
  surfSpot: SurfSpot
  user: User | null
  navigate: (path: string) => void
  onFetcherSubmit: (
    params: FetcherSubmitParams,
    updatedSurfSpot: SurfSpot,
  ) => void
}

export const SurfSpotPreview = memo((props: IProps) => {
  const { surfSpot, user, navigate, onFetcherSubmit } = props
  const { beachBottomType, name, rating, skillLevel, path, type } = surfSpot

  return (
    <div className="surf-spot-preview">
      <div className="surf-spot-preview-content">
        <div className="column surf-spot-preview-details">
          <Details label="Break Type" value={type} />
          <Details label="Beach Bottom" value={beachBottomType} />
          <Details label="Skill Level" value={skillLevel} />
          <Details label="Rating" value={rating ? `${rating}/ 5` : 'N/A'} />
        </div>
        <p
          className="surf-spot-preview-link"
          onClick={() => navigate(path)}
          tabIndex={0}
        >
          Learn more
        </p>
        <SurfSpotActions {...{ surfSpot, navigate, user, onFetcherSubmit }} />
      </div>
    </div>
  )
})

SurfSpotPreview.displayName = 'SurfSpotPreview'
