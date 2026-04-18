import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useFetcher, useNavigate } from 'react-router'

import {
  Button,
  CheckboxOption,
  DatePicker,
  DirectionSelectors,
  EmptyState,
  FormComponent,
  FormInput,
  Icon,
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
import { formatDateForInput } from '~/utils/dateUtils'
import {
  ERROR_SAVE_SURF_SESSION,
  getFetcherSubmitStatus,
  SUCCESS_SURF_SESSION_SAVED,
} from '~/utils/errorUtils'
import {
  BASE_SKILL_LEVEL_OPTIONS,
  SELECT_OPTION,
} from '~/types/formData/surfSpots'
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
  } = props
  const navigate = useNavigate()
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
  const lastProcessedFetcherDataRef = useRef<typeof fetcher.data>(undefined)

  const boardField: FormField = useMemo(
    () => buildSurfSessionSurfboardField(surfboards),
    [surfboards],
  )

  const fetcherSubmitStatus = getFetcherSubmitStatus(
    fetcher.data,
    ERROR_SAVE_SURF_SESSION,
  )
  const formSubmitStatus =
    fetcherSubmitStatus != null && fetcherSubmitStatus.isError
      ? fetcherSubmitStatus
      : null

  const isFormValid = useMemo(() => {
    return !!sessionDate && (!requiresSkillLevel || !!skillLevel)
  }, [sessionDate, requiresSkillLevel, skillLevel])

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
  }, [])

  const handleFormCancel = useCallback(() => {
    resetFields()
    setShowSuccessScreen(false)
    lastProcessedFetcherDataRef.current = undefined
    onCancel()
  }, [onCancel, resetFields])

  useEffect(() => {
    resetFields()
    setShowSuccessScreen(false)
    lastProcessedFetcherDataRef.current = undefined
  }, [surfSpotId, resetFields])

  useEffect(() => {
    if (fetcher.state !== 'idle') return

    if (fetcher.data && fetcher.data !== lastProcessedFetcherDataRef.current) {
      lastProcessedFetcherDataRef.current = fetcher.data
      setShowSuccessScreen(!!fetcher.data.success && !fetcher.data.hasError)
    }
  }, [fetcher.state, fetcher.data])

  const successMessage =
    fetcherSubmitStatus != null && !fetcherSubmitStatus.isError
      ? fetcherSubmitStatus.message
      : SUCCESS_SURF_SESSION_SAVED

  return (
    <div
      className={`info-page-content surf-session-page${
        showSuccessScreen ? ' surf-spot-form-success-page' : ''
      }`}
    >
      <h1>Add session at {surfSpotName}</h1>
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
                Open Sessions to see your log, or return to this spot.
              </p>
              <div className="surf-spot-form-success-actions">
                <Button
                  label="Sessions"
                  type="button"
                  onClick={() => navigate('/sessions')}
                />
                <Button
                  label="View spot"
                  type="button"
                  variant="secondary"
                  onClick={() => onCancel()}
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
          submitLabel="Save session"
          submitStatus={formSubmitStatus}
          isDisabled={!isFormValid}
          onCancel={handleFormCancel}
        >
          <>
            <input type="hidden" name="intent" value="saveSurfSession" />
            <input type="hidden" name="surfSpotId" value={surfSpotId} />
            <p className="surf-session-lead text-secondary">
              Add as much or as little as you like; only the session date is required.
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
