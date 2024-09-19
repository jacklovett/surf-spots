import { Link } from '@remix-run/react'
import { useParams } from 'react-router-dom'

export default function Continent() {
  const { continent } = useParams()
  return (
    <div>
      <h3 className="title">{continent}</h3>
      <div className="list-map">
        <Link to={`/surf-spots/${continent}/portugal`}>Portugal</Link>
        <Link to={`/surf-spots/${continent}/portugal`}>Portugal</Link>
        <Link to={`/surf-spots/${continent}/portugal`}>Portugal</Link>
        <Link to={`/surf-spots/${continent}/portugal`}>Portugal</Link>
        <Link to={`/surf-spots/${continent}/portugal`}>Portugal</Link>
        <Link to={`/surf-spots/${continent}/portugal`}>Portugal</Link>
        <Link to={`/surf-spots/${continent}/portugal`}>Portugal</Link>
        <Link to={`/surf-spots/${continent}/portugal`}>Portugal</Link>
        <Link to={`/surf-spots/${continent}/portugal`}>Portugal</Link>
        <Link to={`/surf-spots/${continent}/portugal`}>Portugal</Link>
        <Link to={`/surf-spots/${continent}/portugal`}>Portugal</Link>
        <Link to={`/surf-spots/${continent}/portugal`}>Portugal</Link>
        <Link to={`/surf-spots/${continent}/portugal`}>Portugal</Link>
        <Link to={`/surf-spots/${continent}/portugal`}>Portugal</Link>
      </div>
    </div>
  )
}
