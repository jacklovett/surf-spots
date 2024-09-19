import { Outlet, useNavigate, useParams } from '@remix-run/react'
import { useState } from 'react'
import { Button, Page } from '~/components'

export default function SurfSpots() {
  const navigate = useNavigate()
  const params = useParams()
  const [isListView, setIsListView] = useState<boolean>(false)
  return (
    <Page showHeader>
      <div className="row space-between center-vertical">
        <h3>Surf Spots</h3>
        {isListView && (
          <Button
            label="See Map"
            onClick={() => {
              setIsListView(false)
              navigate('/surf-spots')
            }}
          />
        )}
        {!isListView && (
          <Button
            label="Find surf spots"
            onClick={() => {
              setIsListView(true)
              navigate('/surf-spots/continents/')
            }}
          />
        )}
      </div>
      <section>
        {!isListView && (
          <div className="center column">
            <p>Map view</p>
          </div>
        )}
        {isListView && (
          <div className="column">
            <div>
              <p>{`World > Europe > Portugal > Algarve > Luz`}</p>
            </div>
            <Outlet />
          </div>
        )}
      </section>
    </Page>
  )
}
