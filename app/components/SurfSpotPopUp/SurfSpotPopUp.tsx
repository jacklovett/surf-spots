import { SurfSpot } from '~/types/surfSpots'
import SurfSpotActions from '../SurfSpotActions'
import Details from '../Details'

interface IProps {
  surfSpot: SurfSpot
  onNavigate: (path: string) => void
}

export const SurfSpotPopUp = (props: IProps) => {
  const { surfSpot, onNavigate } = props
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
        <p
          className="pop-up-link"
          onClick={() => onNavigate(path)}
          tabIndex={0}
        >
          Learn more
        </p>
      </div>
      <SurfSpotActions {...{ surfSpot }} />
    </div>
  )
}
