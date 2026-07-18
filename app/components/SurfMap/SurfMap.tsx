import { memo } from 'react'
import { FetcherWithComponents } from 'react-router'
import classNames from 'classnames'

import 'mapbox-gl/dist/mapbox-gl.css'

import SkeletonLoader from '../SkeletonLoader'
import { SurfSpot } from '~/types/surfSpots'
import { useSurfMap } from '~/hooks'
import { ActionData, SurfSpotQuickActionSubmitHandler } from '~/types/api'
import { ContentStatus, ErrorRecoveryActions } from '~/components'

interface IProps {
  surfSpots?: SurfSpot[]
  disableInteractions?: boolean
  onFetcherSubmit?: SurfSpotQuickActionSubmitHandler
  surfActionFetcher?: FetcherWithComponents<ActionData>
}

export const SurfMap = memo((props: IProps) => {
  const {
    mapContainerRef,
    loading,
    mapReady,
    contentError,
    mapInitError,
    spotsRetryLoading,
    handleRetrySpotsLoad,
    handleRetryMapInit,
    disableInteractions,
  } = useSurfMap(props)

  return (
    <div className={classNames({ 'map-container': true, border: mapReady })}>
      <div
        ref={mapContainerRef}
        className={classNames({
          map: true,
          'map-visible': mapReady,
          'static-map': disableInteractions,
        })}
      />
      {loading && contentError == null && <SkeletonLoader />}
      {contentError != null && (
        <div className="map-spots-error-overlay">
          <ContentStatus
            isError
            actions={
              <ErrorRecoveryActions
                onRetry={
                  mapInitError != null
                    ? handleRetryMapInit
                    : handleRetrySpotsLoad
                }
                retryLoading={spotsRetryLoading}
              />
            }
          >
            <p>{contentError}</p>
          </ContentStatus>
        </div>
      )}
    </div>
  )
})

