import { memo } from 'react'
import { useNavigate } from 'react-router'

import { SurfSpot } from '~/types/surfSpots'

interface IProps {
  surfSpots: SurfSpot[]
}

const compareNames = (left: string, right: string): number =>
  left.localeCompare(right, undefined, { sensitivity: 'base' })

const SurfSpotList = memo((props: IProps): JSX.Element => {
  const { surfSpots } = props
  const navigate = useNavigate()

  const groupedSurfSpots = surfSpots.reduce(
    (groupedSpots, spot) => {
      const { continent, country } = spot

      if (!continent || !country) {
        throw new Error('Incomplete surf spot data')
      }

      const continentName = continent.name
      const countryName = country.name

      groupedSpots[continentName] = groupedSpots[continentName] || {}
      groupedSpots[continentName][countryName] =
        groupedSpots[continentName][countryName] || []
      groupedSpots[continentName][countryName].push(spot)
      return groupedSpots
    },
    {} as Record<string, Record<string, SurfSpot[]>>,
  )

  const continents = Object.keys(groupedSurfSpots).sort(compareNames)

  return (
    <>
      {continents.map((continent) => {
        const countries = Object.keys(groupedSurfSpots[continent]).sort(
          compareNames,
        )
        return (
          <div key={continent} className="mv">
            <h3 className="surf-spot-region">{continent}</h3>
            {countries.map((country) => {
              const spots = [...groupedSurfSpots[continent][country]].sort(
                (left, right) => {
                  const regionCompare = compareNames(
                    left.region?.name ?? '',
                    right.region?.name ?? '',
                  )
                  if (regionCompare !== 0) {
                    return regionCompare
                  }
                  return compareNames(left.name, right.name)
                },
              )
              return (
                <div key={country}>
                  <h4 className="surf-spot-region">{country}</h4>
                  <div className="surf-spot-container mv">
                    <table className="surf-spot-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Region</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {spots.map((spot) => {
                          const { id, name, path, region, type } = spot
                          return (
                            <tr
                              key={id}
                              className="table-row"
                              onClick={() => navigate(path)}
                            >
                              <td>{name}</td>
                              <td>{region?.name}</td>
                              <td>{type}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
    </>
  )
})

export default SurfSpotList
