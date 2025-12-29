import { useState, useEffect, useRef, useCallback } from 'react'
import { useFetcher } from 'react-router'
import { Tide, SkillLevel, SurfSpotNote } from '~/types/surfSpots'
import { DirectionSelectors, FormInput, FormComponent, Button } from '~/components'
import { useSettingsContext, useSurfSpotsContext } from '~/contexts'
import { directionStringToArray, directionArrayToString } from '~/utils/surfSpotUtils'
import { getWaveUnits } from '~/utils/unitUtils'
import { useFormValidation } from '~/hooks'
import { validateNumberRange } from '~/hooks/useFormValidation'
import { parseSwellRange, formatSwellRange } from './index'

interface SurfSpotNoteFormProps {
  surfSpotId: string
  surfSpotName: string
  fetcher?: ReturnType<typeof useFetcher>
  action?: string
}

const getInitialFormState = (note: SurfSpotNote | null) => {
  if (!note) {
    return {
      noteText: '',
      preferredTide: '',
      preferredSwellDirection: '',
      preferredWind: '',
      minPreferredSwellHeight: '',
      maxPreferredSwellHeight: '',
      skillRequirement: '',
    }
  }

  const swellRange = parseSwellRange(note.preferredSwellRange)
  return {
    noteText: note.noteText,
    preferredTide: note.preferredTide || '',
    preferredSwellDirection: note.preferredSwellDirection || '',
    preferredWind: note.preferredWind || '',
    minPreferredSwellHeight: swellRange.min,
    maxPreferredSwellHeight: swellRange.max,
    skillRequirement: note.skillRequirement || '',
  }
}

export const SurfSpotNoteForm = ({ surfSpotId, surfSpotName, fetcher: propFetcher, action: propAction }: SurfSpotNoteFormProps) => {
  const { settings } = useSettingsContext()
  const { preferredUnits } = settings
  const { getNote, noteSubmissionComplete, setNoteSubmissionComplete } = useSurfSpotsContext()
  const fetcher = propFetcher ?? useFetcher()
  const waveUnits = getWaveUnits(preferredUnits)
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const note = getNote(surfSpotId) ?? null

  const [swellDirectionArray, setSwellDirectionArray] = useState<string[]>([])
  const [windDirectionArray, setWindDirectionArray] = useState<string[]>([])

  // Max swell height: 100ft or ~31m (100 / 3.28084)
  const maxSwellHeight = preferredUnits === 'metric' ? 31 : 100

  const { formState, errors, isFormValid, handleChange, handleBlur, setFormState } =
    useFormValidation({
      initialFormState: getInitialFormState(note),
      validationFunctions: {
        minPreferredSwellHeight: (value) => 
          validateNumberRange(value, 0, maxSwellHeight, 'Min Swell Height'),
        maxPreferredSwellHeight: (value) => 
          validateNumberRange(value, 0, maxSwellHeight, 'Max Swell Height'),
      },
    })

  // Initialize form state and direction arrays from note
  useEffect(() => {
    if (note) {
      setSwellDirectionArray(directionStringToArray(note.preferredSwellDirection || ''))
      setWindDirectionArray(directionStringToArray(note.preferredWind || ''))
      setFormState(getInitialFormState(note))
      if (note.noteText) {
        handleBlur('noteText')
      }
    } else {
      setSwellDirectionArray([])
      setWindDirectionArray([])
      setFormState(getInitialFormState(null))
    }
  }, [note])

  // Clear submission state when parent shows toast
  useEffect(() => {
    if (noteSubmissionComplete && isSubmitting) {
      setIsSubmitting(false)
      setNoteSubmissionComplete(false)
    }
  }, [noteSubmissionComplete, isSubmitting, setNoteSubmissionComplete])

  const fetcherData = fetcher.data as { submitStatus?: string; hasError?: boolean } | undefined
  const submitStatus = fetcherData?.submitStatus
    ? { message: fetcherData.submitStatus, isError: fetcherData.hasError || false }
    : null

  const updateSwellRange = (min: string, max: string) => {
    const form = formRef.current
    if (form) {
      const hiddenInput = form.querySelector('input[name="preferredSwellRange"]') as HTMLInputElement
      if (hiddenInput) {
        hiddenInput.value = formatSwellRange(min, max, waveUnits)
      }
    }
  }

  const handleSwellHeightChange = (field: 'minPreferredSwellHeight' | 'maxPreferredSwellHeight', value: string) => {
    handleChange(field, value)
    const min = field === 'minPreferredSwellHeight' ? value : formState.minPreferredSwellHeight
    const max = field === 'maxPreferredSwellHeight' ? value : formState.maxPreferredSwellHeight
    updateSwellRange(min, max)
  }

  const handleSubmit = () => {
    if (formRef.current && !isSubmitting) {
      setIsSubmitting(true)
      const formData = new FormData(formRef.current)
      fetcher.submit(formData, { method: 'post', action: propAction })
    }
  }

  const handleSwellDirectionChange = useCallback((directions: string[]) => {
    setSwellDirectionArray(directions)
    handleChange('preferredSwellDirection', directionArrayToString(directions))
  }, [handleChange])

  const handleWindDirectionChange = useCallback((directions: string[]) => {
    setWindDirectionArray(directions)
    handleChange('preferredWind', directionArrayToString(directions))
  }, [handleChange])

  return (
    <div className="note-form-container">
      <div className="note-form-content">
        <FormComponent
            isDisabled={!isFormValid}
            submitLabel={note ? 'Save Notes' : 'Create Notes'}
            submitStatus={null}
            method="post"
            fetcher={fetcher}
            action={propAction}
            hideSubmitButton
            formId="note-form"
            formRef={formRef}
          >
          <p>
            {note
              ? `Update your notes for ${surfSpotName}. Note your ideal conditions, access details, nearby spots, and anything else that helps you score better sessions.`
              : `Save your personal preferences and local knowledge for ${surfSpotName}. Note your ideal conditions, access details, nearby spots, and anything else that helps you score better sessions.`}
          </p>
          <input type="hidden" name="intent" value="saveNote" />
          <input type="hidden" name="surfSpotId" value={surfSpotId} />

          <FormInput
            field={{
              label: 'Notes',
              name: 'noteText',
              type: 'textarea',
            }}
            value={formState.noteText}
            onChange={(e) => handleChange('noteText', e.target.value)}
            onBlur={() => handleBlur('noteText')}
            errorMessage={errors.noteText || ''}
            showLabel={!!formState.noteText}
          />

          <section className="pv">
            <h3 className="m-0 pt">Preferred Conditions</h3>
            <DirectionSelectors
              swellDirectionArray={swellDirectionArray}
              windDirectionArray={windDirectionArray}
              onSwellDirectionChange={handleSwellDirectionChange}
              onWindDirectionChange={handleWindDirectionChange}
              swellFormName="preferredSwellDirection"
              windFormName="preferredWind"
            />
            <FormInput
              field={{
                label: 'Preferred Tide',
                name: 'preferredTide',
                type: 'select',
                options: [
                  { key: '', value: '', label: 'Select Preferred Tide' },
                  ...Object.values(Tide).map((tide) => ({
                    key: tide,
                    value: tide,
                    label: tide,
                  })),
                ],
              }}
              value={formState.preferredTide}
              onChange={(e) => handleChange('preferredTide', e.target.value)}
              showLabel={!!formState.preferredTide}
            />
            <div>
              <p className="m-0 pt bold">Preferred Swell Height</p>
              <div className="form-inline">
                <FormInput
                  field={{
                    label: `Min Swell Height (${waveUnits})`,
                    name: 'minPreferredSwellHeight',
                    type: 'number',
                  }}
                  value={formState.minPreferredSwellHeight}
                  onChange={(e) => handleSwellHeightChange('minPreferredSwellHeight', e.target.value)}
                  onBlur={() => handleBlur('minPreferredSwellHeight')}
                  errorMessage={errors.minPreferredSwellHeight || ''}
                  showLabel={!!formState.minPreferredSwellHeight}
                />
                <FormInput
                  field={{
                    label: `Max Swell Height (${waveUnits})`,
                    name: 'maxPreferredSwellHeight',
                    type: 'number',
                  }}
                  value={formState.maxPreferredSwellHeight}
                  onChange={(e) => handleSwellHeightChange('maxPreferredSwellHeight', e.target.value)}
                  onBlur={() => handleBlur('maxPreferredSwellHeight')}
                  errorMessage={errors.maxPreferredSwellHeight || ''}
                  showLabel={!!formState.maxPreferredSwellHeight}
                />
              </div>
              <input
                type="hidden"
                name="preferredSwellRange"
                value={formatSwellRange(formState.minPreferredSwellHeight, formState.maxPreferredSwellHeight, waveUnits)}
              />
            </div>
            <FormInput
              field={{
                label: 'Skill Requirement',
                name: 'skillRequirement',
                type: 'select',
                options: [
                  { key: '', value: '', label: 'Select Skill Requirement' },
                  ...Object.values(SkillLevel).map((level) => ({
                    key: level,
                    value: level,
                    label: level,
                  })),
                ],
              }}
              value={formState.skillRequirement}
              onChange={(e) => handleChange('skillRequirement', e.target.value)}
              showLabel={!!formState.skillRequirement}
            />
          </section>
        </FormComponent>
      </div>
      <div className="drawer-form-actions">
        <Button
          label={note ? 'Save Notes' : 'Create Notes'}
          type="button"
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          loading={isSubmitting}
        />
      </div>
    </div>
  )
}

