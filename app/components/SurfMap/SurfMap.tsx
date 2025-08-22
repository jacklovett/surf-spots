import { useRef, useState, memo } from 'react'
import classNames from 'classnames'

import 'mapbox-gl/dist/mapbox-gl.css'

import SkeletonLoader from '../SkeletonLoader'
import { SurfSpot } from '~/types/surfSpots'
import { useDynamicMap, useStaticMap } from '~/hooks'
import { FetcherSubmitParams } from '../SurfSpotActions'

interface IProps {
  surfSpots?: SurfSpot[]
  disableInteractions?: boolean
  onFetcherSubmit?: (params: FetcherSubmitParams) => void
}

export const SurfMap = memo((props: IProps) => {
  const { surfSpots, disableInteractions, onFetcherSubmit } = props
  const [loading, setLoading] = useState(true)

  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  if (disableInteractions && surfSpots && surfSpots.length > 0) {
    const { longitude, latitude } = surfSpots[0]
    useStaticMap({ longitude, latitude }, mapContainerRef, setLoading)
  } else {
    useDynamicMap(mapContainerRef, setLoading, onFetcherSubmit)
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
})

SurfMap.displayName = 'SurfMap'
