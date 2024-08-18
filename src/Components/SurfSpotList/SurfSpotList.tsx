import { SurfSpot } from '../../Controllers/surfSpotController'
import Button from '../Button'

interface IProps {
  surfSpots: SurfSpot[]
  selectedSurfSpot: SurfSpot | null
  setSelectedSurfSpot: (surfSpot: SurfSpot) => void
  navigate: (path: string) => void
}

const SurfSpotList = (props: IProps): JSX.Element => {
  const { surfSpots, selectedSurfSpot, setSelectedSurfSpot, navigate } = props

  return (
    <div className="card surf-spots">
      <div className="actions">
        {selectedSurfSpot && (
          <Button
            onClick={() => navigate(`/edit-surf-spot/${selectedSurfSpot.id}`)}
            label="Edit"
          />
        )}
        <Button onClick={() => navigate('/add-surf-spot')} label="Add" />
      </div>
      <div className="surf-spot-container">
        <table className="surf-spot-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Region</th>
              <th>Country</th>
              <th>Continent</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {surfSpots?.map((surfSpot: SurfSpot) => {
              const { id, name, country, continent, region, rating } = surfSpot
              console.log(selectedSurfSpot)
              console.log(selectedSurfSpot?.id === id)
              return (
                <tr
                  key={id}
                  className={`table-row ${
                    selectedSurfSpot?.id === id ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedSurfSpot(surfSpot)}
                >
                  <td>{name}</td>
                  <td>{region}</td>
                  <td>{country}</td>
                  <td>{continent}</td>
                  <td className="center-td">{rating}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SurfSpotList
