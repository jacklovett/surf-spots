import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useFetcher, useNavigate, useNavigation } from 'react-router'

import {
  Button,
  CheckboxOption,
  DatePicker,
  DirectionSelectors,
  EmptyState,
  FormComponent,
  FormInput,
  Icon,
  TimeInput,
} from '~/components'
import { FormField, InputElementType } from '~/components/FormInput'
import { ActionData } from '~/types/api'
import { Surfboard } from '~/types/surfboard'
import {
  buildSurfSessionSurfboardField,
  SURF_SESSION_CROWD_LEVEL_FIELD,
  SURF_SESSION_TIDE_FIELD,
  SURF_SESSION_WAVE_QUALITY_FIELD,
  SURF_SESSION_WAVE_SIZE_FIELD,
} from '~/types/formData/surfSessionForm'
import {
  formatDateForInput,
  formatDurationCompact,
  sessionWindowMinutesFromTimeInputs,
  timeToHHmm,
} from '~/utils/dateUtils'
import {
  ERROR_SAVE_SURF_SESSION,
  ERROR_UPDATE_SURF_SESSION,
  getFetcherSubmitStatus,
  SUCCESS_SURF_SESSION_SAVED,
  SUCCESS_SURF_SESSION_UPDATED,
} from '~/utils/errorUtils'
import {
  isSurfSessionTimingBannerMessage,
  validateSurfSessionTimeWindow,
} from '~/utils/surfSessionTimingValidation'
import {
  BASE_SKILL_LEVEL_OPTIONS,
  SELECT_OPTION,
} from '~/types/formData/surfSpots'
import { SurfSessionListItem } from '~/types/surfSpots'
import { sessionDirectionStoredToArray } from '~/utils/surfSpotUtils'

const valueFromSelectChange = (event: ChangeEvent<InputElementType>) =>
  (event.target as HTMLSelectElement).value

interface SurfSessionFormProps {
  surfSpotId: string
  surfSpotName: string
  formActionPath: string
  fetcher: ReturnType<typeof useFetcher<ActionData>>
  surfboards?: Surfboard[]
  requiresSkillLevel?: boolean
  onCancel: () => void
  mode?: 'create' | 'edit'
  initialSession?: SurfSessionListItem
  externalEditNotice?: string | null
}

export const SurfSessionForm = (props: SurfSessionFormProps) => {
  const {
    surfSpotId,
    surfSpotName,
    formActionPath,
    fetcher,
    surfboards = [],
    requiresSkillLevel = false,
    onCancel,
    mode = 'create',
    initialSession,
    externalEditNotice,
  } = props
  const navigate = useNavigate()
  const navigation = useNavigation()
  const [successCtaPending, setSuccessCtaPending] = useState<
    'sessions' | 'spot' | null
  >(null)
  const [showSuccessScreen, setShowSuccessScreen] = useState(false)
  const [sessionDate, setSessionDate] = useState(() =>
    formatDateForInput(new Date()),
  )
  const [swellDirectionArray, setSwellDirectionArray] = useState<string[]>([])
  const [windDirectionArray, setWindDirectionArray] = useState<string[]>([])
  const [tide, setTide] = useState('')
  const [waveSize, setWaveSize] = useState('')
  const [crowdLevel, setCrowdLevel] = useState('')
  const [waveQuality, setWaveQuality] = useState('')
  const [skillLevel, setSkillLevel] = useState('')
  const [wouldSurfAgain, setWouldSurfAgain] = useState(false)
  const [surfboardId, setSurfboardId] = useState('')
  const [sessionNotes, setSessionNotes] = useState('')
  const [sessionStartTime, setSessionStartTime] = useState('')
  const [sessionEndTime, setSessionEndTime] = useState('')
  const lastProcessedFetcherDataRef = useRef<typeof fetcher.data>(undefined)

  const boardField: FormField = useMemo(
    () => buildSurfSessionSurfboardField(surfboards),
    [surfboards],
  )

  const sessionTimingError = useMemo(
    () => validateSurfSessionTimeWindow(sessionStartTime, sessionEndTime),
    [sessionStartTime, sessionEndTime],
  )

  const sessionWindowPreview = useMemo(() => {
    if (sessionTimingError != null) {
      return null
    }

    const mins = sessionWindowMinutesFromTimeInputs(
      sessionStartTime,
      sessionEndTime,
    )

    if (mins == null) {
      return null
    }

    return formatDurationCompact(mins)
  }, [sessionTimingError, sessionStartTime, sessionEndTime])

  const hasManualTimeInputs =
    sessionStartTime.trim() !== '' || sessionEndTime.trim() !== ''

  const attachStoredSessionInstantsToPayload =
    mode === 'edit' &&
    initialSession != null &&
    !hasManualTimeInputs &&
    (initialSession.sessionStartInstant != null ||
      initialSession.sessionEndInstant != null)

  const fetcherSubmitStatus = getFetcherSubmitStatus(
    fetcher.data,
    mode === 'edit' ? ERROR_UPDATE_SURF_SESSION : ERROR_SAVE_SURF_SESSION,
  )
  const formSubmitStatus =
    fetcherSubmitStatus != null &&
    fetcherSubmitStatus.isError &&
    !isSurfSessionTimingBannerMessage(fetcherSubmitStatus.message)
      ? fetcherSubmitStatus
      : null

  const fetcherReturnedSaveSuccess =
    fetcher.state === 'idle' &&
    fetcher.data != null &&
    !!fetcher.data.success &&
    !fetcher.data.hasError

  const keepSubmitBusyUntilSuccessUi =
    fetcherReturnedSaveSuccess && !showSuccessScreen

  const isFormValid = useMemo(() => {
    return (
      !!sessionDate &&
      (!requiresSkillLevel || !!skillLevel) &&
      sessionTimingError == null
    )
  }, [sessionDate, requiresSkillLevel, skillLevel, sessionTimingError])

  const resetFields = useCallback(() => {
    setSessionDate(formatDateForInput(new Date()))
    setSwellDirectionArray([])
    setWindDirectionArray([])
    setTide('')
    setWaveSize('')
    setCrowdLevel('')
    setWaveQuality('')
    setSkillLevel('')
    setWouldSurfAgain(false)
    setSurfboardId('')
    setSessionNotes('')
    setSessionStartTime('')
    setSessionEndTime('')
  }, [])

  const handleFormCancel = useCallback(() => {
    resetFields()
    setShowSuccessScreen(false)
    setSuccessCtaPending(null)
    lastProcessedFetcherDataRef.current = undefined
    onCancel()
  }, [onCancel, resetFields])

  useEffect(() => {
    if (mode === 'edit') {
      return
    }
    resetFields()
    setShowSuccessScreen(false)
    setSuccessCtaPending(null)
    lastProcessedFetcherDataRef.current = undefined
  }, [surfSpotId, mode, resetFields])

  useEffect(() => {
    if (mode !== 'edit' || initialSession == null) {
      return
    }
    const isoDate = initialSession.sessionDate
    setSessionDate(
      isoDate.length >= 10
        ? isoDate.slice(0, 10)
        : formatDateForInput(new Date(isoDate)),
    )
    setSwellDirectionArray(sessionDirectionStoredToArray(initialSession.swellDirection))
    setWindDirectionArray(sessionDirectionStoredToArray(initialSession.windDirection))
    setTide(initialSession.tide ?? '')
    setWaveSize(initialSession.waveSize ?? '')
    setCrowdLevel(initialSession.crowdLevel ?? '')
    setWaveQuality(initialSession.waveQuality ?? '')
    setSkillLevel(initialSession.skillLevel ?? '')
    setWouldSurfAgain(initialSession.wouldSurfAgain === true)
    setSurfboardId(initialSession.surfboardId ?? '')
    setSessionNotes(initialSession.sessionNotes ?? '')
    setSessionStartTime(timeToHHmm(initialSession.sessionStartTime ?? ''))
    setSessionEndTime(timeToHHmm(initialSession.sessionEndTime ?? ''))
    setShowSuccessScreen(false)
    setSuccessCtaPending(null)
    lastProcessedFetcherDataRef.current = undefined
  }, [mode, initialSession])

  useEffect(() => {
    if (navigation.state === 'idle') {
      setSuccessCtaPending(null)
    }
  }, [navigation.state])

  useEffect(() => {
    if (fetcher.state !== 'idle') return
    if (fetcher.data && fetcher.data !== lastProcessedFetcherDataRef.current) {
      lastProcessedFetcherDataRef.current = fetcher.data
      setShowSuccessScreen(!!fetcher.data.success && !fetcher.data.hasError)
    }
  }, [fetcher.state, fetcher.data])

  const defaultSuccessMessage =
    mode === 'edit'
      ? SUCCESS_SURF_SESSION_UPDATED
      : SUCCESS_SURF_SESSION_SAVED

  const successMessage =
    fetcherSubmitStatus != null && !fetcherSubmitStatus.isError
      ? fetcherSubmitStatus.message
      : defaultSuccessMessage

  return (
    <div
      className={`info-page-content surf-session-page ${
        showSuccessScreen ? 'surf-spot-form-success-page' : ''
      }`}
    >
      <h1>
        {mode === 'edit'
          ? `Edit session at ${surfSpotName}`
          : `Add session at ${surfSpotName}`}
      </h1>
      {showSuccessScreen && (
        <div className="surf-spot-form-success-wrapper">
          <div className="surf-spot-form-success column">
            <div className="ph center column">
              <div className="surf-spot-form-success-icon mb">
                <Icon iconKey="success" useCurrentColor />
              </div>
              <p className="surf-spot-form-success-message bold">
                {successMessage}
              </p>
              <p className="surf-spot-form-success-subtext">
                {mode === 'edit'
                  ? 'Return to My sessions to see the updated entry.'
                  : 'Open Sessions to see your log, or return to this spot.'}
              </p>
              <div className="surf-spot-form-success-actions">
                <Button
                  label="Sessions"
                  type="button"
                  loading={successCtaPending === 'sessions'}
                  disabled={successCtaPending === 'spot'}
                  onClick={() => {
                    setSuccessCtaPending('sessions')
                    navigate('/sessions')
                  }}
                />
                <Button
                  label="View spot"
                  type="button"
                  variant="secondary"
                  loading={successCtaPending === 'spot'}
                  disabled={successCtaPending === 'sessions'}
                  onClick={() => {
                    setSuccessCtaPending('spot')
                    onCancel()
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {!showSuccessScreen && (
        <FormComponent
          fetcher={fetcher}
          action={formActionPath}
          method="post"
          submitLabel={mode === 'edit' ? 'Save changes' : 'Save session'}
          submitStatus={formSubmitStatus}
          isDisabled={!isFormValid}
          onCancel={handleFormCancel}
          isSubmitting={
            fetcher.state === 'submitting' ||
            fetcher.state === 'loading' ||
            keepSubmitBusyUntilSuccessUi
          }
        >
          <>
            <input
              type="hidden"
              name="intent"
              value={mode === 'edit' ? 'updateSurfSession' : 'saveSurfSession'}
            />
            <input type="hidden" name="surfSpotId" value={surfSpotId} />
            {attachStoredSessionInstantsToPayload &&
              initialSession?.sessionStartInstant != null &&
              initialSession.sessionStartInstant !== '' && (
                <input
                  type="hidden"
                  name="sessionStartInstant"
                  value={initialSession.sessionStartInstant}
                />
              )}
            {attachStoredSessionInstantsToPayload &&
              initialSession?.sessionEndInstant != null &&
              initialSession.sessionEndInstant !== '' && (
                <input
                  type="hidden"
                  name="sessionEndInstant"
                  value={initialSession.sessionEndInstant}
                />
              )}
            {externalEditNotice != null && externalEditNotice !== '' && (
              <p
                className="surf-session-external-notice text-secondary"
                role="note"
              >
                {externalEditNotice}
              </p>
            )}
            <p className="surf-session-lead text-secondary">
              {mode === 'edit'
                ? 'Update the fields you want for this session, then save.'
                : 'Add as much or as little as you like; only the session date is required.'}
            </p>
            <div className="column">
              <div className="form-inline">
                {requiresSkillLevel && (
                  <FormInput
                    field={{
                      label: 'Skill Level',
                      name: 'skillLevel',
                      type: 'select',
                      options: [SELECT_OPTION, ...BASE_SKILL_LEVEL_OPTIONS],
                    }}
                    value={skillLevel}
                    onChange={(event) =>
                      setSkillLevel(valueFromSelectChange(event))
                    }
                    showLabel
                  />
                )}
                <DatePicker
                  label="Session date"
                  name="sessionDate"
                  value={sessionDate}
                  onChange={(event) => setSessionDate(event.target.value)}
                  max={formatDateForInput(new Date())}
                  showLabel
                />
              </div>
              <h2 className="surf-session-section-title">Session window (optional)</h2>
              <div className="surf-session-time-fields form-inline">
                <TimeInput
                  label="Start time"
                  name="sessionStartTime"
                  value={sessionStartTime}
                  onChange={(event) => setSessionStartTime(event.target.value)}
                  showLabel
                />
                <TimeInput
                  label="End time"
                  name="sessionEndTime"
                  value={sessionEndTime}
                  onChange={(event) => setSessionEndTime(event.target.value)}
                  showLabel
                />
              </div>
              {sessionTimingError != null && (
                <p
                  className="surf-session-timing-inline form-error"
                  role="alert"
                >
                  {sessionTimingError}
                </p>
              )}
              {sessionWindowPreview != null && (
                <p
                  className="surf-session-duration-preview text-secondary"
                  aria-live="polite"
                >
                  <span className="surf-session-duration-preview-label">
                    Duration
                  </span>{' '}
                  <span className="surf-session-duration-preview-value">
                    {sessionWindowPreview}
                  </span>
                </p>
              )}
              <h2 className="surf-session-section-title">Conditions</h2>
              <DirectionSelectors
                swellDirectionArray={swellDirectionArray}
                windDirectionArray={windDirectionArray}
                onSwellDirectionChange={setSwellDirectionArray}
                onWindDirectionChange={setWindDirectionArray}
              />
              <div className="form-inline">
                <FormInput
                  field={SURF_SESSION_TIDE_FIELD}
                  value={tide}
                  onChange={(event) => setTide(valueFromSelectChange(event))}
                  showLabel
                />
                <FormInput
                  field={SURF_SESSION_WAVE_SIZE_FIELD}
                  value={waveSize}
                  onChange={(event) => setWaveSize(valueFromSelectChange(event))}
                  showLabel
                />
              </div>
              <div className="form-inline">
                <FormInput
                  field={SURF_SESSION_WAVE_QUALITY_FIELD}
                  value={waveQuality}
                  onChange={(event) =>
                    setWaveQuality(valueFromSelectChange(event))
                  }
                  showLabel
                />
                <FormInput
                  field={SURF_SESSION_CROWD_LEVEL_FIELD}
                  value={crowdLevel}
                  onChange={(event) =>
                    setCrowdLevel(valueFromSelectChange(event))
                  }
                  showLabel
                />
              </div>
              {surfboards.length > 0 ? (
                <FormInput
                  field={boardField}
                  value={surfboardId}
                  onChange={(event) =>
                    setSurfboardId(valueFromSelectChange(event))
                  }
                  showLabel
                />
              ) : (
                <EmptyState
                  title="No boards in your quiver"
                  description="Add a surfboard to your collection so you can tag which board you used on this session."
                  ctaText="Add a surfboard"
                  onCtaClick={() => navigate('/add-surfboard')}
                />
              )}
              <div className="column mv">
                <CheckboxOption
                  name="wouldSurfAgain"
                  title="Would surf again in similar conditions"
                  checked={wouldSurfAgain}
                  onChange={setWouldSurfAgain}
                />
              </div>
              <FormInput
                field={{
                  label: 'Session notes',
                  name: 'sessionNotes',
                  type: 'textarea',
                  validationRules: { maxLength: 2000 },
                }}
                value={sessionNotes}
                onChange={(event) => setSessionNotes(event.target.value)}
                showLabel
                placeholder="Sections that worked, tide or crowd details, what to try next time…"
              />
            </div>
          </>
        </FormComponent>
      )}
    </div>
  )
}

SurfSessionForm.displayName = 'SurfSessionForm'
