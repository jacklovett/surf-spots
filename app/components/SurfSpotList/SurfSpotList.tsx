import { useNavigate } from 'react-router';
import { SurfSpot } from '~/types/surfSpots'

interface IProps {
  surfSpots: SurfSpot[]
}

const SurfSpotList = (props: IProps): JSX.Element => {
  const { surfSpots } = props
  const navigate = useNavigate()
  // Group surf spots by continent, then by country
  const groupedSurfSpots = surfSpots.reduce((groupedSpots, spot) => {
    const { continent, country } = spot

    if (!continent || !country) {
      throw new Error('Incomplete surf spot data')
    }

    const continentName = continent.name
    const countryName = country.name

    // Initialize the continent group if it doesn't exist in the accumulator
    groupedSpots[continentName] = groupedSpots[continentName] || {}
    // Initialize the country group within the continent if it doesn't exist
    groupedSpots[continentName][countryName] =
      groupedSpots[continentName][countryName] || []
    // Add the current surf spot to the correct country group
    groupedSpots[continentName][countryName].push(spot)
    // Return the updated accumulator so it can be used in the next iteration
    return groupedSpots
  }, {} as Record<string, Record<string, SurfSpot[]>>)

  return (
    <>
      {/* Iterate over each continent */}
      {Object.keys(groupedSurfSpots).map((continent) => (
        <div key={continent} className="mv">
          <h3 className="surf-spot-region">{continent}</h3>
          {/* Iterate over each country within the continent */}
          {Object.keys(groupedSurfSpots[continent]).map((country) => (
            <div key={country}>
              <h4 className="surf-spot-region">{country}</h4>
              <div className="surf-spot-container mv">
                <table className="surf-spot-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Region</th>
                      <th>Type</th>
                      <th className="center-td">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Iterate over surf spots in the country */}
                    {groupedSurfSpots[continent][country].map((spot) => {
                      const { id, name, rating, region, type } = spot
                      return (
                        <tr
                          key={spot.id}
                          className="table-row"
                          onClick={() => navigate(`/surf-spot/${id}`)}
                        >
                          <td>{name}</td>
                          <td>{region?.name}</td>
                          <td>{type}</td>
                          <td className="center-td">{rating ?? '-'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  )
}

export default SurfSpotList
