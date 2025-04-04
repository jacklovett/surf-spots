import { useRef, useState } from 'react'
import classNames from 'classnames'

import 'mapbox-gl/dist/mapbox-gl.css'

import { SkeletonLoader } from '../index'
import { SurfSpot } from '~/types/surfSpots'
import { useDynamicMap, useStaticMap } from '~/hooks'

interface IProps {
  surfSpots?: SurfSpot[]
  disableInteractions?: boolean
}

export const SurfMap = (props: IProps) => {
  const { surfSpots, disableInteractions } = props
  const [loading, setLoading] = useState(true)

  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  if (disableInteractions && surfSpots && surfSpots.length > 0) {
    const { longitude, latitude } = surfSpots[0]
    useStaticMap({ longitude, latitude }, mapContainerRef, setLoading)
  } else {
    useDynamicMap(mapContainerRef, setLoading)
  }

  return (
    <div className={classNames({ 'map-container': true, border: !loading })}>
      <div
        ref={mapContainerRef}
        className={classNames({
          map: true,
          'map-visible': !loading,
          'static-map': disableInteractions,
        })}
      />
      {/* Skeleton Loader shown on top of the map while loading */}
      {loading && <SkeletonLoader />}
    </div>
  )
}
