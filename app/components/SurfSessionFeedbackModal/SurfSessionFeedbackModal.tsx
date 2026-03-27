import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFetcher } from 'react-router'

import {
  Button,
  CheckboxOption,
  DatePicker,
  FormComponent,
  FormInput,
  Icon,
  Modal,
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

const THANK_YOU_HEADLINE = 'Session saved.'
const THANK_YOU_SUB =
  'Your feedback helps other surfers see how this spot tends to feel in the water.'

const valueFromSelectChange = (ev: ChangeEvent<InputElementType>) =>
  (ev.target as HTMLSelectElement).value

interface IProps {
  isOpen: boolean
  onClose: () => void
  surfSpotId: string
  surfSpotName: string
  actionPath: string
  fetcher: ReturnType<typeof useFetcher<ActionData>>
  surfboards?: Surfboard[]
}

export const SurfSessionFeedbackModal = (props: IProps) => {
  const {
    isOpen,
    onClose,
    surfSpotId,
    surfSpotName,
    actionPath,
    fetcher,
    surfboards = [],
  } = props
  const [showThankYou, setShowThankYou] = useState(false)
  const [sessionDate, setSessionDate] = useState(() =>
    formatDateForInput(new Date()),
  )
  const [waveSize, setWaveSize] = useState('')
  const [crowdLevel, setCrowdLevel] = useState('')
  const [waveQuality, setWaveQuality] = useState('')
  const [wouldSurfAgain, setWouldSurfAgain] = useState(false)
  const [surfboardId, setSurfboardId] = useState('')
  const lastProcessedFetcherDataRef = useRef<typeof fetcher.data>(undefined)
  const wasOpenRef = useRef(false)

  const boardField: FormField = useMemo(
    () => buildSessionFeedbackSurfboardField(surfboards),
    [surfboards],
  )

  const isFormValid = useMemo(() => {
    return (
      !!sessionDate.trim() &&
      !!waveSize.trim() &&
      !!crowdLevel.trim() &&
      !!waveQuality.trim()
    )
  }, [sessionDate, waveSize, crowdLevel, waveQuality])

  const resetFields = useCallback(() => {
    setSessionDate(formatDateForInput(new Date()))
    setWaveSize('')
    setCrowdLevel('')
    setWaveQuality('')
    setWouldSurfAgain(false)
    setSurfboardId('')
  }, [])

  const handleClose = useCallback(() => {
    resetFields()
    setShowThankYou(false)
    lastProcessedFetcherDataRef.current = undefined
    onClose()
  }, [onClose, resetFields])

  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false
      setShowThankYou(false)
      lastProcessedFetcherDataRef.current = undefined
      return
    }

    if (!wasOpenRef.current) {
      lastProcessedFetcherDataRef.current = fetcher.data
      setShowThankYou(false)
      resetFields()
    }
    wasOpenRef.current = true
  }, [isOpen, resetFields, fetcher.data])

  useEffect(() => {
    if (!isOpen) return
    if (fetcher.state !== 'idle') return

    if (fetcher.data && fetcher.data !== lastProcessedFetcherDataRef.current) {
      lastProcessedFetcherDataRef.current = fetcher.data
      setShowThankYou(!!fetcher.data.success && !fetcher.data.hasError)
    }
  }, [isOpen, fetcher.state, fetcher.data])

  if (!isOpen) return null

  return (
    <Modal onClose={handleClose}>
      <div className="session-feedback-modal">
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
              <Button label="Close" type="button" onClick={handleClose} />
            </div>
          </div>
        )}
        {!showThankYou && (
          <FormComponent
            fetcher={fetcher}
            action={actionPath}
            method="post"
            formClassName="session-feedback-form column gap"
            submitLabel="Save session"
            submitStatus={null}
            isDisabled={!isFormValid}
            submitButtonClassName="session-feedback-actions"
            onCancel={handleClose}
            cancelLabel="Skip"
            cancelButtonClassName="session-feedback-skip"
          >
            <div className="modal-scrollable-content column gap">
              <input type="hidden" name="intent" value="saveSessionFeedback" />
              <input type="hidden" name="surfSpotId" value={surfSpotId} />
              <h3 className="session-feedback-title">
                Your session at {surfSpotName}
              </h3>
              <fieldset className="session-feedback-fieldset">
                <legend className="session-feedback-legend">When did you surf?</legend>
                <div className="session-feedback-session-date">
                  <DatePicker
                    label="Session date"
                    name="sessionDate"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    max={formatDateForInput(new Date())}
                    showLabel
                  />
                </div>
              </fieldset>
              <FormInput
                field={SESSION_FEEDBACK_WAVE_SIZE_FIELD}
                value={waveSize}
                onChange={(ev) => setWaveSize(valueFromSelectChange(ev))}
                showLabel
              />
              <FormInput
                field={SESSION_FEEDBACK_CROWD_LEVEL_FIELD}
                value={crowdLevel}
                onChange={(ev) => setCrowdLevel(valueFromSelectChange(ev))}
                showLabel
              />
              <FormInput
                field={SESSION_FEEDBACK_WAVE_QUALITY_FIELD}
                value={waveQuality}
                onChange={(ev) => setWaveQuality(valueFromSelectChange(ev))}
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
                  onChange={(ev) => setSurfboardId(valueFromSelectChange(ev))}
                  showLabel
                />
              )}
            </div>
          </FormComponent>
        )}
      </div>
    </Modal>
  )
}

SurfSessionFeedbackModal.displayName = 'SurfSessionFeedbackModal'
