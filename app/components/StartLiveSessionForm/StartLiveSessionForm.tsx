import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Link, useFetcher } from 'react-router'

import {
  CheckboxOption,
  ContentStatus,
  ErrorRecoveryActions,
  FormComponent,
  StartSessionMap,
  TimeInput,
  UseMyLocationButton
} from '~/components'
import { useLiveSessionContext, useToastContext } from '~/contexts'
import { useStartLiveSessionLocation } from '~/hooks/useStartLiveSessionLocation'
import { ActionData } from '~/types/api'
import {
  ERROR_START_LIVE_SURF_SESSION,
  getFetcherSubmitStatus,
  SUCCESS_SURF_SESSION_STARTED,
} from '~/utils/errorUtils'
import {
  buildExpectedReturnInstantFromLocalTime,
  getBrowserIanaTimeZone,
} from '~/utils/dateUtils'
import { scrollPageToTop } from '~/utils/scrollPageToTop'

import StartLiveSessionSuccess from './StartLiveSessionSuccess'

interface StartLiveSessionFormProps {
  formActionPath: string
  fetcher: ReturnType<typeof useFetcher<ActionData>>
  hasEmergencyContactEmail: boolean
  onCancel: () => void
}

const defaultExpectedReturnTime = (): string => {
  const defaultReturn = new Date()
  defaultReturn.setSeconds(0, 0)
  defaultReturn.setMilliseconds(0)
  defaultReturn.setHours(defaultReturn.getHours() + 2)
  const hours = String(defaultReturn.getHours()).padStart(2, '0')
  const minutes = String(defaultReturn.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export const StartLiveSessionForm = (props: StartLiveSessionFormProps) => {
  const { formActionPath, fetcher, hasEmergencyContactEmail, onCancel } = props
  const { showError } = useToastContext()
  const { setInProgressSession } = useLiveSessionContext()
  const sessionLocation = useStartLiveSessionLocation({ showError })
  const [shareLocationWithEmergencyContact, setShareLocationWithEmergencyContact] =
    useState(false)
  const [expectedReturnTime, setExpectedReturnTime] = useState(defaultExpectedReturnTime)
  const [startIanaZoneId, setStartIanaZoneId] = useState('')

  useEffect(() => {
    setStartIanaZoneId(getBrowserIanaTimeZone())
  }, [])

  const [showSuccessScreen, setShowSuccessScreen] = useState(false)
  const [startedSessionId, setStartedSessionId] = useState<number | null>(null)
  const lastProcessedFetcherDataRef = useRef<typeof fetcher.data>(undefined)

  const expectedReturnInstant = useMemo(() => {
    if (!shareLocationWithEmergencyContact) {
      return null
    }
    return buildExpectedReturnInstantFromLocalTime(expectedReturnTime)
  }, [expectedReturnTime, shareLocationWithEmergencyContact])

  const fetcherSubmitStatus = getFetcherSubmitStatus(
    fetcher.data,
    ERROR_START_LIVE_SURF_SESSION,
  )
  const formSubmitStatus =
    fetcherSubmitStatus != null && fetcherSubmitStatus.isError
      ? fetcherSubmitStatus
      : null

  const fetcherReturnedSaveSuccess =
    fetcher.state === 'idle' &&
    fetcher.data != null &&
    fetcher.data.success &&
    !fetcher.data.hasError

  const keepSubmitBusyUntilSuccessUi =
    fetcherReturnedSaveSuccess && !showSuccessScreen

  useEffect(() => {
    if (fetcher.state !== 'idle') {
      return
    }
    if (fetcher.data && fetcher.data !== lastProcessedFetcherDataRef.current) {
      lastProcessedFetcherDataRef.current = fetcher.data
      const shouldShowSuccess = !!fetcher.data.success && !fetcher.data.hasError
      if (shouldShowSuccess) {
        scrollPageToTop()
      }
      if (fetcher.data.inProgressSession != null) {
        setInProgressSession(fetcher.data.inProgressSession)
        setStartedSessionId(fetcher.data.inProgressSession.id)
      }
      setShowSuccessScreen(shouldShowSuccess)
    }
  }, [fetcher.state, fetcher.data, setInProgressSession])

  const handleExpectedReturnTimeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => 
      setExpectedReturnTime(event.target.value),
    [],
  )

  const { hiddenFields, map, locationActions, status, resetCoordinates } =
    sessionLocation

  const handleFormCancel = useCallback(() => {
    setShowSuccessScreen(false)
    setStartedSessionId(null)
    resetCoordinates()
    lastProcessedFetcherDataRef.current = undefined
    onCancel()
  }, [resetCoordinates, onCancel])

  const successMessage =
    fetcherSubmitStatus != null && !fetcherSubmitStatus.isError
      ? fetcherSubmitStatus.message
      : SUCCESS_SURF_SESSION_STARTED

  const sharingRequiresExpectedReturn =
    shareLocationWithEmergencyContact && hasEmergencyContactEmail
  const hasValidExpectedReturn =
    !sharingRequiresExpectedReturn || expectedReturnInstant != null
  const canSubmitSession =
    sessionLocation.canStartSession && hasValidExpectedReturn

  const isSubmitting =
    fetcher.state === 'submitting' ||
    fetcher.state === 'loading' ||
    keepSubmitBusyUntilSuccessUi

  return (
    <div
      className={`info-page-content surf-session-page start-live-session-page map-content ${
        showSuccessScreen ? 'surf-spot-form-success-page' : ''
      }`}
    >
      {showSuccessScreen ? (
        <StartLiveSessionSuccess
          message={successMessage}
          startedSessionId={startedSessionId}
        />
      ) : (
        <>
          <h1 className="ph">Start session</h1>
          <p className="surf-session-lead text-secondary ph">
            Go surf! Start when you are ready to begin your session. When you are
            done, come back to end the session and record how it went.
          </p>
          <FormComponent
            fetcher={fetcher}
            action={formActionPath}
            method="post"
            formClassName="start-live-session-form"
            submitLabel="Start session"
            submitStatus={formSubmitStatus}
            isDisabled={!canSubmitSession}
            onCancel={handleFormCancel}
            isSubmitting={isSubmitting}
          >
            <>
              <input type="hidden" name="intent" value="startLiveSurfSession" />
              {startIanaZoneId !== '' && (
                <input type="hidden" name="startIanaZoneId" value={startIanaZoneId} />
              )}
              {hiddenFields.startLatitude != null &&
                hiddenFields.startLongitude != null && (
                  <>
                    <input
                      type="hidden"
                      name="startLatitude"
                      value={String(hiddenFields.startLatitude)}
                    />
                    <input
                      type="hidden"
                      name="startLongitude"
                      value={String(hiddenFields.startLongitude)}
                    />
                  </>
                )}
              {!!expectedReturnInstant && (
                <input
                  type="hidden"
                  name="expectedReturnInstant"
                  value={expectedReturnInstant}
                />
              )}
              <div className="start-live-session-fields column">
                {status.isGeolocationLoading && (
                  <p className="surf-session-location-status m-0" aria-live="polite">
                    Getting your location…
                  </p>
                )}
                {status.isGeolocationUnavailable && (
                  <ContentStatus
                    isError
                    actions={
                      <ErrorRecoveryActions
                        onRetry={locationActions.onUseMyLocation}
                        retryLoading={locationActions.useMyLocationRequesting}
                      />
                    }
                  >
                    <p>
                      Could not get your location automatically. Click the map to set
                      it, or try again.
                    </p>
                  </ContentStatus>
                )}
                <div className="start-live-session-location-section column">
                  <div className="start-session-map-header row space-between ph mb-s">
                    <h2 className="m-0">Location</h2>
                    {locationActions.showUseMyLocation && (
                      <UseMyLocationButton
                        onClick={locationActions.onUseMyLocation}
                        disabled={locationActions.useMyLocationDisabled}
                        isRequesting={locationActions.useMyLocationRequesting}
                      />
                    )}
                  </div>
                  <p className="surf-session-lead text-secondary ph">
                    We record where you start the session. If you share with your
                    emergency contact, that is the location they receive.
                  </p>
                  <div className="find-spot-map session-inline-map">
                    <StartSessionMap
                      ref={sessionLocation.mapRef}
                      userCoordinates={sessionLocation.coordinates}
                      showUserLocationMarker={map.showUserLocationMarker}
                      allowManualPlacement={map.allowManualPlacement}
                      instructionText={map.instructionText}
                      onManualPlacement={map.onManualPlacement}
                    />
                  </div>
                </div>
                {status.showManualPlacementRequired && (
                  <p className="font-small text-secondary">
                    Set your starting location on the map to start.
                  </p>
                )}
                <CheckboxOption
                  name="shareLocationWithEmergencyContact"
                  title="Email emergency contact"
                  description="Share your starting location with your emergency contact, so they can know where you were in case something goes wrong. This is not live tracking. They will get updated that you are done, so remember to end your session!"
                  checked={shareLocationWithEmergencyContact}
                  disabled={!hasEmergencyContactEmail}
                  onChange={setShareLocationWithEmergencyContact}
                />
                {!hasEmergencyContactEmail && (
                  <p className="text-secondary font-small">
                    Add an emergency contact email in{' '}
                    <Link to="/profile">profile</Link> to use this.
                  </p>
                )}
                {sharingRequiresExpectedReturn && (
                  <div className="start-live-session-expected-return">
                    <div className="start-live-session-expected-return-layout">
                      <p className="start-live-session-expected-return-copy font-small text-secondary m-0">
                        Choose when you expect to be back. Your emergency contact will see
                        this in the email. If you have not ended your session by then, they
                        will receive a warning.
                      </p>
                      <TimeInput
                        label="Expected return time"
                        name="expectedReturnTime"
                        value={expectedReturnTime}
                        onChange={handleExpectedReturnTimeChange}
                        showLabel
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          </FormComponent>
        </>
      )}
    </div>
  )
}

export default StartLiveSessionForm
