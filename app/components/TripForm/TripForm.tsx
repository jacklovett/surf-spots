import { useState, useEffect } from 'react'
import {
  DatePicker,
  FormComponent,
  FormInput,
  TextButton,
} from '~/components'
import { SubmitStatus } from '~/components/FormComponent'
import useFormValidation, {
  validateEmail,
  validateRequired,
} from '~/hooks/useFormValidation'
import { Trip } from '~/types/trip'
import { formatDateForInput } from '~/utils/dateUtils'

interface TripFormProps {
  actionType: 'Add' | 'Edit'
  trip?: Trip
  submitStatus: SubmitStatus | null
  onCancel?: () => void
  allowMembers?: boolean
}

export const TripForm = ({
  actionType,
  trip,
  submitStatus,
  onCancel,
  allowMembers = false,
}: TripFormProps) => {

  const { formState, errors, isFormValid, handleChange, handleBlur } =
    useFormValidation({
      initialFormState: {
        title: trip?.title || '',
        description: trip?.description || '',
        startDate: trip?.startDate || '',
        endDate: trip?.endDate || '',
      },
      validationFunctions: {
        title: (value?: string) => validateRequired(value, 'Title'),
        startDate: (value?: string) => validateRequired(value, 'Start Date'),
        endDate: (value?: string) => validateRequired(value, 'End Date'),
      },
    })

  // For edit mode, mark populated required fields as touched so validity reflects existing values.
  useEffect(() => {
    if (actionType === 'Edit') {
      if (formState.title) {
        handleBlur('title')
      }
      if (formState.startDate) {
        handleBlur('startDate')
      }
      if (formState.endDate) {
        handleBlur('endDate')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [memberEmails, setMemberEmails] = useState<string[]>([''])
  const [memberEmailErrors, setMemberEmailErrors] = useState<
    Record<number, string>
  >({})

  const addMemberField = () => setMemberEmails([...memberEmails, ''])
  const removeMemberField = (index: number) =>
    setMemberEmails(memberEmails.filter((_, i) => i !== index))

  const updateMemberEmail = (index: number, email: string) => {
    const updated = [...memberEmails]
    updated[index] = email
    setMemberEmails(updated)

    // Validate email if it has a value (optional fields)
    if (email.trim()) {
      const error = validateEmail(email, 'Email')
      setMemberEmailErrors((prev) => ({
        ...prev,
        [index]: error,
      }))
    } else {
      // Clear error if field is empty (since it's optional)
      setMemberEmailErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[index]
        return newErrors
      })
    }
  }

  return (
    <div className="trip-edit-form">
      <h1>{actionType === 'Add' ? 'Create New Trip' : 'Edit Trip'}</h1>

      <FormComponent
        isDisabled={!isFormValid}
        submitLabel={actionType === 'Add' ? 'Create Trip' : 'Save Changes'}
        submitStatus={submitStatus}
        method={actionType === 'Edit' ? 'put' : 'post'}
        onCancel={onCancel}
      >
        <FormInput
          field={{
            label: 'Title',
            name: 'title',
            type: 'text',
            validationRules: { required: true },
          }}
          value={formState.title}
          onChange={(e) => handleChange('title', e.target.value)}
          onBlur={() => handleBlur('title')}
          errorMessage={errors.title}
          showLabel={!!formState.title}
        />
        <FormInput
          field={{
            label: 'Description',
            name: 'description',
            type: 'textarea',
          }}
          value={formState.description}
          onChange={(e) => handleChange('description', e.target.value)}
          showLabel={!!formState.description}
        />
        <DatePicker
          label="Start Date"
          name="startDate"
          value={formState.startDate}
          onChange={(e) => handleChange('startDate', e.target.value)}
          onBlur={() => handleBlur('startDate')}
          errorMessage={errors.startDate}
          min={
            actionType === 'Add' ? formatDateForInput(new Date()) : undefined
          }
          showLabel={!!formState.startDate}
        />
        <DatePicker
          label="End Date"
          name="endDate"
          value={formState.endDate}
          onChange={(e) => handleChange('endDate', e.target.value)}
          onBlur={() => handleBlur('endDate')}
          errorMessage={errors.endDate}
          min={
            formState.startDate || formatDateForInput(new Date())
          }
          showRangePreview
          showLabel={!!formState.endDate}
        />

        {allowMembers && (
          <div className="trip-members-section">
            <h2>Invite Members (Optional)</h2>
            <p className="text-secondary">
              Add email addresses of people you want to invite to this trip.
              They will be able to view and add content to the trip.
            </p>
            {memberEmails.map((email, index) => (
              <div key={index} className="form-inline">
                <FormInput
                  field={{
                    label:
                      memberEmails.length === 1
                        ? 'Email'
                        : `Email ${index + 1}`,
                    name: `memberEmail_${index}`,
                    type: 'email',
                  }}
                  value={email}
                  onChange={(e) => updateMemberEmail(index, e.target.value)}
                  errorMessage={memberEmailErrors[index]}
                  showLabel={!!email}
                />
                {memberEmails.length > 1 && (
                  <TextButton
                    text="Remove"
                    onClick={() => removeMemberField(index)}
                    iconKey="bin"
                    filled
                    danger
                  />
                )}
              </div>
            ))}
            <div className="mt">
              <TextButton
                text="Add Another Member"
                onClick={addMemberField}
                iconKey="plus"
                filled
              />
            </div>
          </div>
        )}
      </FormComponent>
    </div>
  )
}
