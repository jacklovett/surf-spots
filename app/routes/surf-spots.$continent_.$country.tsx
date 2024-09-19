import { Link } from '@remix-run/react'
import { useParams } from 'react-router-dom'

export default function Country() {
  const { continent, country } = useParams()
  return (
    <div>
      <h3 className="title">{continent}</h3>
      <p className="title">{country}</p>
      <div className="list-map">
        <Link to={`/surf-spots/${continent}/${country}/algarve`}>Algarve</Link>
      </div>
    </div>
  )
}
