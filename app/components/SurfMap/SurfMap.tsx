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
  /** Journey map: soft-green fill for countries with surfed spots. */
  highlightCountries?: boolean
  onFetcherSubmit?: SurfSpotQuickActionSubmitHandler
  surfActionFetcher?: FetcherWithComponents<ActionData>
}

export const SurfMap = memo((props: IProps) => {
  const {
    disableInteractions,
    highlightCountries,
    onFetcherSubmit,
    surfActionFetcher,
    surfSpots,
  } = props

  const {
    mapContainerRef,
    loading,
    mapReady,
    spotsLoading,
    contentError,
    mapInitError,
    spotsRetryLoading,
    handleRetrySpotsLoad,
    handleRetryMapInit,
  } = useSurfMap({
    disableInteractions,
    highlightCountries,
    onFetcherSubmit,
    surfActionFetcher,
    surfSpots,
  })

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
      {spotsLoading && contentError == null && mapReady && (
        <div
          className="map-spots-loading-overlay"
          role="status"
          aria-live="polite"
          aria-label="Loading spots"
        >
          <div className="map-spots-loading-chip">
            <span className="button-loading-spinner" aria-hidden="true" />
          </div>
        </div>
      )}
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
