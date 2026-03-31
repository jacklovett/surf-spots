import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useFetcher } from 'react-router'

import {
  Button,
  CheckboxOption,
  DatePicker,
  FormComponent,
  FormInput,
  Icon,
} from '~/components'
import { FormField, InputElementType } from '~/components/FormInput'
import { ActionData } from '~/types/api'
import { Surfboard } from '~/types/surfboard'
import {
  buildSessionFeedbackSurfboardField,
  SESSION_FEEDBACK_CROWD_LEVEL_FIELD,
  SESSION_FEEDBACK_WAVE_QUALITY_FIELD,
  SESSION_FEEDBACK_WAVE_SIZE_FIELD,
} from '~/types/formData/surfSessionFeedback'
import { formatDateForInput } from '~/utils/dateUtils'
import {
  ERROR_SAVE_SESSION_FEEDBACK,
  getFetcherSubmitStatus,
} from '~/utils/errorUtils'
import { BASE_SKILL_LEVEL_OPTIONS, SELECT_OPTION } from '~/types/formData/surfSpots'

const THANK_YOU_HEADLINE = 'Session saved.'
const THANK_YOU_SUB =
  'Your feedback helps other surfers see how this spot tends to feel in the water.'

const valueFromSelectChange = (event: ChangeEvent<InputElementType>) =>
  (event.target as HTMLSelectElement).value

interface SurfSessionFeedbackFormProps {
  surfSpotId: string
  surfSpotName: string
  formActionPath: string
  fetcher: ReturnType<typeof useFetcher<ActionData>>
  surfboards?: Surfboard[]
  requiresSkillLevel?: boolean
  onCancel: () => void
}

export const SurfSessionFeedbackForm = (props: SurfSessionFeedbackFormProps) => {
  const {
    surfSpotId,
    surfSpotName,
    formActionPath,
    fetcher,
    surfboards = [],
    requiresSkillLevel = false,
    onCancel,
  } = props
  const [showThankYou, setShowThankYou] = useState(false)
  const [sessionDate, setSessionDate] = useState(() =>
    formatDateForInput(new Date()),
  )
  const [waveSize, setWaveSize] = useState('')
  const [crowdLevel, setCrowdLevel] = useState('')
  const [waveQuality, setWaveQuality] = useState('')
  const [skillLevel, setSkillLevel] = useState('')
  const [wouldSurfAgain, setWouldSurfAgain] = useState(false)
  const [surfboardId, setSurfboardId] = useState('')
  const lastProcessedFetcherDataRef = useRef<typeof fetcher.data>(undefined)

  const boardField: FormField = useMemo(
    () => buildSessionFeedbackSurfboardField(surfboards),
    [surfboards],
  )

  const fetcherData = fetcher.data
  const submitStatus =
    fetcherData != null && typeof fetcherData === 'object' && fetcherData.hasError === true
      ? getFetcherSubmitStatus(fetcherData, ERROR_SAVE_SESSION_FEEDBACK)
      : null

  const isFormValid = useMemo(() => {
    return (
      !!sessionDate &&
      !!waveSize &&
      !!crowdLevel &&
      !!waveQuality &&
      (!requiresSkillLevel || !!skillLevel)
    )
  }, [sessionDate, waveSize, crowdLevel, waveQuality, requiresSkillLevel, skillLevel])

  const resetFields = useCallback(() => {
    setSessionDate(formatDateForInput(new Date()))
    setWaveSize('')
    setCrowdLevel('')
    setWaveQuality('')
    setSkillLevel('')
    setWouldSurfAgain(false)
    setSurfboardId('')
  }, [])

  const handleDismiss = useCallback(() => {
    resetFields()
    setShowThankYou(false)
    lastProcessedFetcherDataRef.current = undefined
    onCancel()
  }, [onCancel, resetFields])

  useEffect(() => {
    // Re-init only when `surfSpotId` changes (not when fetcher returns after submit).
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
    <div className="info-page-content mv session-feedback-page">
      {showThankYou && (
        <div className="session-feedback-thank-you column">
          <div className="session-feedback-thank-you-icon">
            <Icon iconKey="success" useCurrentColor />
          </div>
          <p className="session-feedback-thank-you-headline bold">
            {THANK_YOU_HEADLINE}
          </p>
          <p className="session-feedback-thank-you-sub">{THANK_YOU_SUB}</p>
          <div className="session-feedback-thank-you-actions">
            <Button label="Close" type="button" onClick={handleDismiss} />
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
            <input type="hidden" name="intent" value="saveSessionFeedback" />
            <input type="hidden" name="surfSpotId" value={surfSpotId} />
            <h1>Log Session at {surfSpotName}</h1>
            <div className="column gap">
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
            <FormInput
              field={SESSION_FEEDBACK_WAVE_SIZE_FIELD}
              value={waveSize}
              onChange={(event) => setWaveSize(valueFromSelectChange(event))}
              showLabel
            />
            <FormInput
              field={SESSION_FEEDBACK_CROWD_LEVEL_FIELD}
              value={crowdLevel}
              onChange={(event) => setCrowdLevel(valueFromSelectChange(event))}
              showLabel
            />
            <FormInput
              field={SESSION_FEEDBACK_WAVE_QUALITY_FIELD}
              value={waveQuality}
              onChange={(event) => setWaveQuality(valueFromSelectChange(event))}
              showLabel
            />
            <CheckboxOption
              name="wouldSurfAgain"
              title="Would you surf here again?"
              description="Check if you would return to this spot; leave unchecked if not."
              checked={wouldSurfAgain}
              onChange={setWouldSurfAgain}
            />
            {surfboards.length > 0 && (
              <FormInput
                field={boardField}
                value={surfboardId}
                onChange={(event) => setSurfboardId(valueFromSelectChange(event))}
                showLabel
              />
            )}
          </div>
          </>
        </FormComponent>
      )}
    </div>
  )
}

SurfSessionFeedbackForm.displayName = 'SurfSessionFeedbackForm'
