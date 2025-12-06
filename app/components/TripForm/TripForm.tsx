import { useState, useEffect } from 'react'
import { useNavigation } from 'react-router'
import {
  FormInput,
  FormComponent,
  DatePicker,
  Button,
  TextButton,
} from '~/components'
import { SubmitStatus } from '~/components/FormComponent'
import {
  validateEmail,
  validateRequired,
  default as useFormValidation,
} from '~/hooks/useFormValidation'
import { Trip } from '~/types/trip'

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
  const { state } = useNavigation()
  const loading = state === 'loading' || state === 'submitting'

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
      },
    })

  // For edit mode, mark title as touched if it has a value
  // This ensures the form is valid immediately when editing with existing data
  useEffect(() => {
    if (actionType === 'Edit' && trip?.title && formState.title) {
      // Trigger a blur on the title field to mark it as touched
      // This will make the form valid if all fields are valid
      handleBlur('title')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

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
        loading={loading}
        isDisabled={loading || !isFormValid}
        submitLabel={actionType === 'Add' ? 'Create Trip' : 'Save Changes'}
        submitStatus={submitStatus}
        method={actionType === 'Edit' ? 'put' : 'post'}
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
          showLabel={actionType === 'Edit' ? !!formState.title : true}
        />
        <FormInput
          field={{
            label: 'Description',
            name: 'description',
            type: 'textarea',
          }}
          value={formState.description}
          onChange={(e) => handleChange('description', e.target.value)}
          showLabel={actionType === 'Edit' ? !!formState.description : true}
        />
        <DatePicker
          label="Start Date"
          name="startDate"
          value={formState.startDate}
          onChange={(e) => handleChange('startDate', e.target.value)}
          min={
            actionType === 'Add'
              ? new Date().toISOString().split('T')[0]
              : undefined
          }
          showLabel={actionType === 'Edit' ? !!formState.startDate : true}
        />
        <DatePicker
          label="End Date"
          name="endDate"
          value={formState.endDate}
          onChange={(e) => handleChange('endDate', e.target.value)}
          min={formState.startDate || new Date().toISOString().split('T')[0]}
          showRangePreview={true}
          showLabel={actionType === 'Edit' ? !!formState.endDate : true}
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
                  showLabel
                />
                {memberEmails.length > 1 && (
                  <TextButton
                    text="Remove"
                    onClick={() => removeMemberField(index)}
                    iconKey="bin"
                    filled
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

      {onCancel && (
        <div className="mt">
            <Button
              label="Cancel"
              onClick={() => onCancel()}
              variant="cancel"
            />
        </div>
      )}
    </div>
  )
}
