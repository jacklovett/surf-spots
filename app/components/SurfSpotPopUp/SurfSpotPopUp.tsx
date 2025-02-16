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

export const SurfSpotPopUp = (props: IProps) => {
  const { surfSpot, user, navigate, onFetcherSubmit } = props
  const { beachBottomType, name, rating, skillLevel, path, type } = surfSpot

  return (
    <div className="pop-up-container">
      <h4 className="pop-up-title">{name}</h4>
      <div className="pop-up-content">
        <div className="row pop-up-details">
          <Details label="Break Type" value={type} />
          <Details label="Beach Bottom" value={beachBottomType} />
          <Details label="Skill Level" value={skillLevel} />
          <Details label="Rating" value={rating ? `${rating}/ 5` : 'N/A'} />
        </div>
        <p className="pop-up-link" onClick={() => navigate(path)} tabIndex={0}>
          Learn more
        </p>
        <SurfSpotActions {...{ surfSpot, navigate, user, onFetcherSubmit }} />
      </div>
    </div>
  )
}
