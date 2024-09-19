import { Link } from '@remix-run/react'

export default function Continents() {
  return (
    <div className="column">
      <h3>List of continents</h3>
      <Link to="/surf-spots/africa">Africa</Link>
      <Link to="/surf-spots/asia">Asia</Link>
      <Link to="/surf-spots/Australia">Australia</Link>
      <Link to="/surf-spots/europe">Europe</Link>
      <Link to="/surf-spots/north-america">North America</Link>
      <Link to="/surf-spots/south-america">South America</Link>
    </div>
  )
}
