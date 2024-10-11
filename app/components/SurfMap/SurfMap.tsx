import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import { addMarkersForSurfSpots, MAP_ACCESS_TOKEN } from '~/services/mapService'
import { SkeletonLoader } from '../index'
import { SurfSpot } from '~/types/surfSpots'
import { useStaticMap } from '~/hooks/useStaticMap'
import { useDynamicMap } from '~/hooks'

interface IProps {
  surfSpots: SurfSpot[]
  disableInteractions?: boolean
}

export const SurfMap = (props: IProps) => {
  const { surfSpots, disableInteractions } = props
  const [loading, setLoading] = useState(true)

  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  if (disableInteractions) {
    const { longitude, latitude } = surfSpots[0]
    useStaticMap({ longitude, latitude }, mapContainerRef, setLoading)
  } else {
    useDynamicMap(surfSpots, mapContainerRef, setLoading)
  }

  return (
    <div className="map-container">
      <div
        ref={mapContainerRef}
        className={`map ${loading ? '' : 'map-visible'}`}
      />
      {/* Skeleton Loader shown on top of the map while loading */}
      {loading && <SkeletonLoader />}
    </div>
  )
}
