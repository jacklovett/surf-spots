import { useEffect } from 'react'
import { useNavigation } from 'react-router'
import { FormInput, FormComponent } from '~/components'
import { SubmitStatus } from '~/components/FormComponent'
import useFormValidation, {
  validateRequired,
  validateUrl,
} from '~/hooks/useFormValidation'
import { Surfboard } from '~/types/surfboard'
import { formatLength, formatDimension } from '~/utils/surfboardUtils'
import {
  BOARD_TYPE_OPTIONS,
  FIN_SETUP_OPTIONS,
  STANDARD_BOARD_TYPES,
} from '~/types/formData/surfboards'

interface SurfboardFormProps {
  actionType: 'Add' | 'Edit'
  surfboard?: Surfboard
  submitStatus: SubmitStatus | null
  onCancel?: () => void
}

export const SurfboardForm = ({
  actionType,
  surfboard,
  submitStatus,
  onCancel,
}: SurfboardFormProps) => {
  const { state } = useNavigation()
  const loading = state === 'loading' || state === 'submitting'

  // Determine initial board type state
  const getInitialBoardType = () => {
    if (!surfboard?.boardType) return ''
    return STANDARD_BOARD_TYPES.includes(surfboard.boardType)
      ? surfboard.boardType
      : 'other'
  }

  const { formState, errors, isFormValid, handleChange, handleBlur } =
    useFormValidation({
      initialFormState: {
        name: surfboard?.name || '',
        boardType: getInitialBoardType(),
        length: surfboard?.length ? formatLength(surfboard.length) : '',
        width: surfboard?.width ? formatDimension(surfboard.width) : '',
        thickness: surfboard?.thickness
          ? formatDimension(surfboard.thickness)
          : '',
        volume: surfboard?.volume?.toString() || '',
        finSetup: surfboard?.finSetup || '',
        description: surfboard?.description || '',
        modelUrl: surfboard?.modelUrl || '',
      },
      validationFunctions: {
        name: (value?: string) => validateRequired(value, 'Name'),
        modelUrl: (value?: string) => {
          if (!value) return ''
          return validateUrl(value, 'Model link')
        },
      },
    })

  // For edit mode, mark name as touched if it has a value
  // This ensures the form is valid immediately when editing with existing data
  useEffect(() => {
    if (actionType === 'Edit' && surfboard?.name && formState.name) {
      handleBlur('name')
    }
  }, []) // Only run once on mount

  return (
    <FormComponent
      isDisabled={loading || !isFormValid}
      submitLabel={actionType === 'Add' ? 'Add Surfboard' : 'Save Changes'}
      submitStatus={submitStatus}
      method={actionType === 'Edit' ? 'put' : 'post'}
      onCancel={onCancel}
    >
      <FormInput
        field={{
          label: 'Name',
          name: 'name',
          type: 'text',
          validationRules: { required: true },
        }}
        value={formState.name}
        onChange={(e) => handleChange('name', e.target.value)}
        onBlur={() => handleBlur('name')}
        errorMessage={errors.name || ''}
        showLabel={!!formState.name}
      />
      <FormInput
        field={{
          label: 'Board Type',
          name: 'boardType',
          type: 'select',
          options: BOARD_TYPE_OPTIONS,
        }}
        value={formState.boardType}
        onChange={(e) => handleChange('boardType', e.target.value)}
        showLabel={!!formState.boardType}
      />
      <div className="form-row">
        <FormInput
          field={{
            label: 'Length (ft & in)',
            name: 'length',
            type: 'text',
          }}
          value={formState.length}
          onChange={(e) => handleChange('length', e.target.value)}
          showLabel
          placeholder="e.g. 6'1"
        />
        <FormInput
          field={{
            label: 'Width (in)',
            name: 'width',
            type: 'text',
          }}
          value={formState.width}
          onChange={(e) => handleChange('width', e.target.value)}
          showLabel
          placeholder="e.g. 20 1/2"
        />
      </div>
      <div className="form-row">
        <FormInput
          field={{
            label: 'Thickness (in)',
            name: 'thickness',
            type: 'text',
          }}
          value={formState.thickness}
          onChange={(e) => handleChange('thickness', e.target.value)}
          showLabel
          placeholder="e.g. 2 5/8"
        />
        <FormInput
          field={{
            label: 'Volume (L)',
            name: 'volume',
            type: 'number',
          }}
          value={formState.volume}
          onChange={(e) => handleChange('volume', e.target.value)}
          showLabel={!!formState.volume}
        />
      </div>
      <FormInput
        field={{
          label: 'Fin Setup',
          name: 'finSetup',
          type: 'select',
          options: FIN_SETUP_OPTIONS,
        }}
        value={formState.finSetup}
        onChange={(e) => handleChange('finSetup', e.target.value)}
        showLabel={!!formState.finSetup}
      />
      <FormInput
        field={{
          label: 'Description / Notes',
          name: 'description',
          type: 'textarea',
        }}
        value={formState.description}
        onChange={(e) => handleChange('description', e.target.value)}
        showLabel={!!formState.description}
      />
      <FormInput
        field={{
          label: 'Model Link',
          name: 'modelUrl',
          type: 'url',
        }}
        value={formState.modelUrl}
        onChange={(e) => handleChange('modelUrl', e.target.value)}
        onBlur={() => handleBlur('modelUrl')}
        showLabel
        errorMessage={errors.modelUrl || ''}
        placeholder="URL to model's product page or specs"
      />
    </FormComponent>
  )
}
