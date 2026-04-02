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
} from '~/utils/errorUtils'
import {
  BASE_SKILL_LEVEL_OPTIONS,
  SELECT_OPTION,
} from '~/types/formData/surfSpots'
const THANK_YOU_HEADLINE = 'Session saved'
const THANK_YOU_SUB =
  'You will find it under My Sessions. Use it later to compare conditions, boards, and how the spot felt for you.'

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
  const [showThankYou, setShowThankYou] = useState(false)
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

  const fetcherData = fetcher.data
  const submitStatus =
    fetcherData != null && typeof fetcherData === 'object' && fetcherData.hasError === true
      ? getFetcherSubmitStatus(fetcherData, ERROR_SAVE_SURF_SESSION)
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

  const handleDismiss = useCallback(() => {
    resetFields()
    setShowThankYou(false)
    lastProcessedFetcherDataRef.current = undefined
    onCancel()
  }, [onCancel, resetFields])

  const handleGoToSessions = useCallback(() => {
    resetFields()
    setShowThankYou(false)
    lastProcessedFetcherDataRef.current = undefined
    navigate('/sessions')
  }, [navigate, resetFields])

  useEffect(() => {
    resetFields()
    setShowThankYou(false)
    lastProcessedFetcherDataRef.current = undefined
  }, [surfSpotId, resetFields])

  useEffect(() => {
    if (fetcher.state !== 'idle') return

    if (fetcher.data && fetcher.data !== lastProcessedFetcherDataRef.current) {
      lastProcessedFetcherDataRef.current = fetcher.data
      setShowThankYou(!!fetcher.data.success && !fetcher.data.hasError)
    }
  }, [fetcher.state, fetcher.data])

  return (
    <div className="info-page-content mv surf-session-page">
      {showThankYou && (
        <div className="surf-session-thank-you column">
          <div className="surf-session-thank-you-icon">
            <Icon iconKey="success" useCurrentColor />
          </div>
          <p className="surf-session-thank-you-headline bold">
            {THANK_YOU_HEADLINE}
          </p>
          <p className="surf-session-thank-you-sub">{THANK_YOU_SUB}</p>
          <div className="surf-session-thank-you-actions">
            <Button
              label="My sessions"
              type="button"
              className="surf-session-thank-you-actions__btn"
              onClick={handleGoToSessions}
            />
            <Button
              label="Close"
              type="button"
              variant="cancel"
              className="surf-session-thank-you-actions__btn"
              onClick={handleDismiss}
            />
          </div>
        </div>
      )}
      {!showThankYou && (
        <FormComponent
          fetcher={fetcher}
          action={formActionPath}
          method="post"
          submitLabel="Save session"
          submitStatus={submitStatus}
          isDisabled={!isFormValid}
          onCancel={handleDismiss}
        >
          <>
            <input type="hidden" name="intent" value="saveSurfSession" />
            <input type="hidden" name="surfSpotId" value={surfSpotId} />
            <h1>Add session at {surfSpotName}</h1>
            <p className="surf-session-lead text-secondary">
              Add as much or as little as you like; only the session date is required.
            </p>
            <div className="column">
              {requiresSkillLevel && (
                <FormInput
                  field={{
                    label: 'Skill Level',
                    name: 'skillLevel',
                    type: 'select',
                    options: [SELECT_OPTION, ...BASE_SKILL_LEVEL_OPTIONS],
                  }}
                  value={skillLevel}
                  onChange={(event) => setSkillLevel(valueFromSelectChange(event))}
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
              <h2 className="surf-session-section-title">Conditions</h2>
              <DirectionSelectors
                swellDirectionArray={swellDirectionArray}
                windDirectionArray={windDirectionArray}
                onSwellDirectionChange={setSwellDirectionArray}
                onWindDirectionChange={setWindDirectionArray}
              />
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
              <FormInput
                field={SURF_SESSION_WAVE_QUALITY_FIELD}
                value={waveQuality}
                onChange={(event) => setWaveQuality(valueFromSelectChange(event))}
                showLabel
              />
              <FormInput
                field={SURF_SESSION_CROWD_LEVEL_FIELD}
                value={crowdLevel}
                onChange={(event) => setCrowdLevel(valueFromSelectChange(event))}
                showLabel
              />
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
              /></div>
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
