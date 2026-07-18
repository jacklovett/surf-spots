import { useNavigate, useFetcher } from 'react-router'

import {
  DatePicker,
  DirectionSelectors,
  EmptyState,
  EndSessionSpotSection,
  FormComponent,
  FormInput,
  Rating,
  SkillLevelHelpLink,
  TimeInput,
} from '~/components'
import { useSurfSessionForm } from '~/hooks'
import { valueFromSelectChange } from '~/components/FormInput'
import { ActionData } from '~/types/api'
import { Surfboard } from '~/types/surfboard'
import {
  SURF_SESSION_CROWD_LEVEL_FIELD,
  SURF_SESSION_TIDE_FIELD,
  SURF_SESSION_WAVE_FACE_FIELD,
  SURF_SESSION_WAVE_SIZE_FIELD,
} from '~/types/formData/surfSessionForm'
import { formatDateForInput } from '~/utils/dateUtils'
import {
  BASE_SKILL_LEVEL_OPTIONS,
  SELECT_OPTION,
} from '~/types/formData/surfSpots'
import { SurfSessionListItem } from '~/types/surfSpots'

import SurfSessionFormSuccess from './SurfSessionFormSuccess'

interface SurfSessionFormProps {
  surfSpotId: string
  surfSpotName: string
  formActionPath: string
  fetcher: ReturnType<typeof useFetcher<ActionData>>
  surfboards?: Surfboard[]
  requiresSkillLevel?: boolean
  onCancel: () => void
  mode?: 'create' | 'edit' | 'end'
  initialSession?: SurfSessionListItem
  externalEditNotice?: string | null
  sessionId?: string
  sessionAlreadyEnded?: boolean
  initialShowSuccessScreen?: boolean
}

export const SurfSessionForm = (props: SurfSessionFormProps) => {
  const navigate = useNavigate()
  const form = useSurfSessionForm(props)

  return (
    <div
      className={`info-page-content surf-session-page ${
        form.showLiveSessionSpotSection && !form.showSuccessScreen
          ? 'map-content'
          : ''
      } ${form.showSuccessScreen ? 'surf-spot-form-success-page' : ''}`}
    >
      {form.showSuccessScreen ? (
        <SurfSessionFormSuccess
          message={form.successMessage}
          subtext={form.endSessionSuccessSubtext}
          endSessionAddSpotPath={form.endSessionAddSpotPath}
          showViewSpot={form.showViewSpotOnSuccess}
          resolvedSpotPath={form.resolvedSpotPathForSuccess}
          onCancel={form.onCancel}
        />
      ) : (
        <>
          <h1 className={form.showLiveSessionSpotSection ? 'ph' : undefined}>
            {form.pageTitle}
          </h1>
          <FormComponent
            fetcher={form.fetcher}
            action={form.formActionPath}
            method="post"
            formClassName={
              form.showLiveSessionSpotSection
                ? 'surf-session-form-with-map'
                : undefined
            }
            submitLabel={form.submitLabel}
            submitStatus={form.formSubmitStatus}
            isDisabled={!form.isFormValid}
            onCancel={form.handleFormCancel}
            isSubmitting={form.isSubmitting}
          >
            <>
              <input type="hidden" name="intent" value={form.formIntent} />
              {form.showLiveSessionSpotSection ? (
                !!form.endSessionSpotResolution.selectedSpotId && (
                  <input
                    type="hidden"
                    name="surfSpotId"
                    value={form.endSessionSpotResolution.selectedSpotId}
                  />
                )
              ) : (
                <input
                  type="hidden"
                  name="surfSpotId"
                  value={form.surfSpotId}
                />
              )}
              {form.isEndMode && !!form.sessionId && (
                <input
                  type="hidden"
                  name="sessionId"
                  value={form.sessionId}
                />
              )}
              {form.attachStoredSessionInstantsToPayload &&
                !!form.initialSession?.sessionStartInstant && (
                  <input
                    type="hidden"
                    name="sessionStartInstant"
                    value={form.initialSession.sessionStartInstant}
                  />
                )}
              {form.attachStoredSessionInstantsToPayload &&
                !!form.initialSession?.sessionEndInstant && (
                  <input
                    type="hidden"
                    name="sessionEndInstant"
                    value={form.initialSession.sessionEndInstant}
                  />
                )}
              {form.showLiveSessionSpotSection &&
                (form.mode === 'edit' || form.sessionAlreadyEnded) && (
                  <input
                    type="hidden"
                    name="sessionDate"
                    value={
                      form.initialSession?.sessionDate
                        ? form.initialSession.sessionDate.length >= 10
                          ? form.initialSession.sessionDate.slice(0, 10)
                          : form.initialSession.sessionDate
                        : form.sessionDate
                    }
                  />
                )}
              {!!form.externalEditNotice && (
                <p
                  className={`surf-session-external-notice text-secondary${
                    form.showLiveSessionSpotSection ? ' ph' : ''
                  }`}
                  role="note"
                >
                  {form.externalEditNotice}
                </p>
              )}
              <p
                className={`surf-session-lead text-secondary${
                  form.showLiveSessionSpotSection ? ' ph' : ''
                }`}
              >
                {form.leadText}
              </p>
              <div className="column surf-session-fields">
                {form.requiresSkillLevel && (
                  <div className="form-inline">
                    <FormInput
                      field={{
                        label: 'Skill Level',
                        name: 'skillLevel',
                        type: 'select',
                        options: [SELECT_OPTION, ...BASE_SKILL_LEVEL_OPTIONS],
                      }}
                      value={form.skillLevel}
                      onChange={(event) =>
                        form.setSkillLevel(valueFromSelectChange(event))
                      }
                      showLabel
                    />
                    <SkillLevelHelpLink />
                  </div>
                )}
                {form.showLiveSessionSpotSection ? (
                  <div className="surf-session-live-location">
                    {(!!form.recordedSessionDateLabel ||
                      (form.hasRecordedLiveSessionTiming &&
                        !!form.recordedSessionWindowLabel)) && (
                      <div className="surf-session-recorded-details ph">
                        <dl className="surf-session-recorded-dl">
                          {!!form.recordedSessionDateLabel && (
                            <div className="surf-session-recorded-row">
                              <dt className="bold text-secondary">Date:</dt>
                              <dd className="bold">
                                {form.recordedSessionDateLabel}
                              </dd>
                            </div>
                          )}
                          {form.hasRecordedLiveSessionTiming &&
                            !!form.recordedSessionWindowLabel && (
                              <div className="surf-session-recorded-row">
                                <dt className="bold text-secondary">Time:</dt>
                                <dd className="bold">
                                  {form.recordedSessionWindowLabel}
                                </dd>
                              </div>
                            )}
                        </dl>
                        {form.hasRecordedLiveSessionTiming &&
                          !!form.recordedSessionWindowLabel && (
                            <p className="font-small text-secondary m-0">
                              Recorded when you ended your live session.
                            </p>
                          )}
                      </div>
                    )}
                    <EndSessionSpotSection
                      spotResolution={form.endSessionSpotResolution}
                    />
                  </div>
                ) : (
                  <>
                    {!form.isEndMode && (
                      <div className="form-inline">
                        <DatePicker
                          label="Session date"
                          name="sessionDate"
                          value={form.sessionDate}
                          onChange={(event) =>
                            form.setSessionDate(event.target.value)
                          }
                          max={formatDateForInput(new Date())}
                          showLabel
                        />
                      </div>
                    )}
                    <div className="surf-session-timing-section">
                      <h2 className="m-0 mb">Session window (optional)</h2>
                      <div className="surf-session-time-fields form-inline">
                        <TimeInput
                          label="Start time"
                          name="sessionStartTime"
                          value={form.sessionStartTime}
                          onChange={(event) =>
                            form.setSessionStartTime(event.target.value)
                          }
                          showLabel
                        />
                        <TimeInput
                          label="End time"
                          name="sessionEndTime"
                          value={form.sessionEndTime}
                          onChange={(event) =>
                            form.setSessionEndTime(event.target.value)
                          }
                          showLabel
                        />
                      </div>
                      {!!form.sessionTimingError && (
                        <p className="font-small form-error m-0" role="alert">
                          {form.sessionTimingError}
                        </p>
                      )}
                      {!!form.sessionWindowPreview && (
                        <p
                          className="font-small text-secondary m-0"
                          aria-live="polite"
                        >
                          <span className="bold">Duration</span>{' '}
                          <span>{form.sessionWindowPreview}</span>
                        </p>
                      )}
                    </div>
                  </>
                )}
                <div className="surf-session-conditions-block">
                  <h2 className="m-0 mb">Conditions</h2>
                  <DirectionSelectors
                    swellDirectionArray={form.swellDirectionArray}
                    windDirectionArray={form.windDirectionArray}
                    onSwellDirectionChange={form.setSwellDirectionArray}
                    onWindDirectionChange={form.setWindDirectionArray}
                  />
                  <div className="form-inline">
                    <FormInput
                      field={SURF_SESSION_TIDE_FIELD}
                      value={form.tide}
                      onChange={(event) =>
                        form.setTide(valueFromSelectChange(event))
                      }
                      showLabel
                    />
                    <FormInput
                      field={SURF_SESSION_WAVE_SIZE_FIELD}
                      value={form.waveSize}
                      onChange={(event) =>
                        form.setWaveSize(valueFromSelectChange(event))
                      }
                      showLabel
                    />
                  </div>
                  <div className="form-inline">
                    <FormInput
                      field={SURF_SESSION_WAVE_FACE_FIELD}
                      value={form.waveFace}
                      onChange={(event) =>
                        form.setWaveFace(valueFromSelectChange(event))
                      }
                      showLabel
                    />
                    <FormInput
                      field={SURF_SESSION_CROWD_LEVEL_FIELD}
                      value={form.crowdLevel}
                      onChange={(event) =>
                        form.setCrowdLevel(valueFromSelectChange(event))
                      }
                      showLabel
                    />
                  </div>
                </div>
                {form.surfboards.length > 0 ? (
                  <FormInput
                    field={form.boardField}
                    value={form.surfboardId}
                    onChange={(event) =>
                      form.setSurfboardId(valueFromSelectChange(event))
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
                <div className="surf-session-rating-field">
                  <div>
                    <label className="bold">Overall rating</label>
                    <Rating
                      value={form.sessionRating}
                      onChange={form.setSessionRating}
                      inputName="sessionRating"
                    />
                  </div>
                  <p className="surf-session-rating-row font-small text-secondary m-0">
                    How was the session overall? Your rating helps build an
                    honest picture of this spot for surfers like you.
                  </p>
                </div>
                <FormInput
                  field={{
                    label: 'Notes',
                    name: 'sessionNotes',
                    type: 'textarea',
                    validationRules: { maxLength: 2000 },
                  }}
                  value={form.sessionNotes}
                  onChange={(event) =>
                    form.setSessionNotes(event.target.value)
                  }
                  showLabel
                  placeholder="Sections that worked, tide or crowd details, what to try next time…"
                />
              </div>
            </>
          </FormComponent>
        </>
      )}
    </div>
  )
}
