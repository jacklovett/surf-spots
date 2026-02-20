import { useEffect, useState } from 'react'
import {
  ActionFunction,
  data,
  Link,
  LoaderFunction,
  MetaFunction,
  redirect,
  useLoaderData,
  useFetcher,
} from 'react-router'
import fs from 'fs/promises'
import path from 'path'

import { cacheControlHeader, deleteData, edit } from '~/services/networkService'
import {
  commitSession,
  destroySession,
  getSession,
  requireSessionCookie,
} from '~/services/session.server'
import { useUserContext, useSettingsContext } from '~/contexts'

import {
  ContentStatus,
  Page,
  FormInput,
  FormComponent,
  LocationSelector,
  NavButton,
  Modal,
  Button,
} from '~/components'
import { Location } from '~/components/LocationSelector'
import { useSubmitStatus, useFormSubmission } from '~/hooks'
import useFormValidation, {
  validateEmail,
  validateRequired,
  validateAge,
  validateHeight,
  validateWeight,
} from '~/hooks/useFormValidation'
import { GENDER_OPTIONS, USER_SKILL_LEVEL_OPTIONS } from '~/types/formData/profile'
import {
  convertHeightToDisplay,
  convertHeightFromDisplay,
  convertWeightToDisplay,
  convertWeightFromDisplay,
  getHeightLabel,
  getWeightLabel,
  validateAndConvertHeight,
  validateAndConvertWeight,
} from '~/utils/unitUtils'

interface LoaderData {
  locationData?: Location[]
  error?: string
}

export const meta: MetaFunction = () => [
  { title: 'Surf Spots - Profile' },
  { name: 'description', content: 'User profile page' },
]

export const loader: LoaderFunction = async ({ request }) => {
  await requireSessionCookie(request)
  try {
    const filePath = path.resolve('public/data/cities_countries.json')
    const fileData = await fs.readFile(filePath, 'utf-8')
    const locationData = JSON.parse(fileData)
    return data(
      { locationData },
      {
        headers: cacheControlHeader,
      },
    )
  } catch (error) {
    console.error(error)
    return {
      error: 'Unable to populate location drop-down menus',
    }
  }
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const intent = formData.get('intent')

  // Handle account deletion
  if (intent === 'delete-account') {
    const user = await requireSessionCookie(request)
    const cookie = request.headers.get('Cookie') ?? ''

    try {
      await deleteData(`user/${user.id}`, {
        headers: { Cookie: cookie },
      })

      // Destroy session and redirect
      const session = await getSession(cookie)
      return redirect('/', {
        headers: {
          'Set-Cookie': await destroySession(session),
        },
      })
    } catch (error) {
      console.error('Unable to delete account: ', error)
      return data(
        {
          submitStatus: 'Unable to delete account. Please try again later',
          hasError: true,
        },
        { status: 500 },
      )
    }
  }

  // Handle profile update
  const name = formData.get('name')?.toString().trim() || ''
  const country = formData.get('country')?.toString().trim() || ''
  const city = formData.get('city')?.toString().trim() || ''
  
  // Normalize and validate age
  const ageStr = formData.get('age')?.toString().trim() || ''
  const age = ageStr ? parseInt(ageStr, 10) : undefined
  if (age !== undefined && (isNaN(age) || age < 13 || age > 120)) {
    return data(
      {
        submitStatus: 'Age must be between 13 and 120 years',
        hasError: true,
      },
      { status: 400 },
    )
  }
  
  const gender = formData.get('gender')?.toString().trim() || undefined
  
  // Get units preference and convert display values to stored values (cm/kg)
  const preferredUnits = (formData.get('preferredUnits')?.toString() || 'metric') as 'metric' | 'imperial'
  
  // Validate and convert height
  const heightDisplay = formData.get('height')?.toString().trim() || undefined
  const heightResult = validateAndConvertHeight(heightDisplay, preferredUnits)
  if (!heightResult.isValid) {
    return data(
      { submitStatus: heightResult.error || 'Please enter a valid height', hasError: true },
      { status: 400 },
    )
  }
  const height = heightResult.value
  
  // Validate and convert weight
  const weightDisplay = formData.get('weight')?.toString().trim() || undefined
  const weightResult = validateAndConvertWeight(weightDisplay, preferredUnits)
  if (!weightResult.isValid) {
    return data(
      { submitStatus: weightResult.error || 'Please enter a valid weight', hasError: true },
      { status: 400 },
    )
  }
  const weight = weightResult.value
  
  const skillLevel = formData.get('skillLevel')?.toString() || undefined

  const user = await requireSessionCookie(request)

  const updateUser = {
    ...user,
    name,
    country,
    city,
    age,
    gender,
    height,
    weight,
    skillLevel,
  }

  const cookie = request.headers.get('Cookie') ?? ''

  try {
    await edit('user/update/profile', updateUser, {
      headers: {
        Cookie: cookie,
      },
    })

    const session = await getSession(cookie)
    session.set('user', updateUser)

    return data(
      { submitStatus: 'Profile updated successfully', hasError: false },
      {
        status: 200,
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      },
    )
  } catch (error) {
    console.error('Unable to update profile details: ', error)
    return data(
      {
        submitStatus:
          'Unable to update profile details. Please try again later',
        hasError: true,
      },
      { status: 500 },
    )
  }
}

const Profile = () => {
  const { user } = useUserContext()
  const { settings } = useSettingsContext()
  const { isFormSubmitting } = useFormSubmission()

  const { locationData = [], error } = useLoaderData<LoaderData>()

  const submitStatus = useSubmitStatus()
  const deleteFetcher = useFetcher()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Convert stored values (cm/kg) to display units for form initialization
  const getDisplayValue = (storedValue: number | undefined, converter: (val: number, units: 'metric' | 'imperial') => string | number | undefined) =>
    storedValue ? converter(storedValue, settings.preferredUnits) : undefined
  
  const heightDisplay = getDisplayValue(user?.height, convertHeightToDisplay)
  const weightDisplay = getDisplayValue(user?.weight, convertWeightToDisplay)

  const { formState, errors, isFormValid, handleChange, handleBlur } =
    useFormValidation({
      initialFormState: {
        country: user?.country || '',
        email: user?.email || '',
        name: user?.name || '',
        city: user?.city || '',
        age: user?.age?.toString() || '',
        gender: user?.gender || '',
        height: heightDisplay?.toString() || '',
        weight: weightDisplay?.toString() || '',
        skillLevel: user?.skillLevel ? String(user.skillLevel) : '',
      },
      validationFunctions: {
        email: validateEmail,
        name: (value?: string) => validateRequired(value, 'Name'),
        age: (value?: string) => validateAge(value),
        height: (value?: string) => validateHeight(value, settings.preferredUnits),
        weight: (value?: string) => validateWeight(value, settings.preferredUnits),
      },
    })

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const handleDeleteAccount = () => 
    deleteFetcher.submit(
      { intent: 'delete-account' },
      { method: 'post' },
    )

  useEffect(
    () => {
      // Convert form values back to stored units for comparison
      const convertForComparison = (displayValue: string, converter: (val: string | number | undefined, units: 'metric' | 'imperial') => number | undefined) =>
        displayValue ? converter(displayValue, settings.preferredUnits) : undefined
      
      const heightFormValue = convertForComparison(formState.height, convertHeightFromDisplay)
      const weightFormValue = convertForComparison(formState.weight, convertWeightFromDisplay)
      const userSkillLevel = user?.skillLevel ? String(user.skillLevel) : ''
      const formSkillLevel = formState.skillLevel || ''
      
      setHasUnsavedChanges(
        (formState.country || '') !== (user?.country || '') ||
          (formState.city || '') !== (user?.city || '') ||
          (formState.name || '') !== (user?.name || '') ||
          (formState.age || '') !== (user?.age?.toString() || '') ||
          (formState.gender || '') !== (user?.gender || '') ||
          heightFormValue !== (user?.height ?? undefined) ||
          weightFormValue !== (user?.weight ?? undefined) ||
          formSkillLevel !== userSkillLevel,
      )
    },
    [formState, user, settings.preferredUnits],
  )

  if (error || !user) {
    return (
      <Page showHeader>
        <ContentStatus isError>
          <p>{error || 'No user profile data found'}</p>
        </ContentStatus>
      </Page>
    )
  }

  return (
    <Page showHeader overrideLoading={isFormSubmitting}>
      {/* Announce form submission state to screen readers */}
      {isFormSubmitting && (
        <div role="status" aria-live="polite" className="sr-only">
          Saving profile changes...
        </div>
      )}
      <div className="info-page-content mv">
        <h1>Profile</h1>
        <FormComponent
          isDisabled={!hasUnsavedChanges || !isFormValid}
          submitLabel="Save Changes"
          submitStatus={submitStatus}
          method="put"
        >
          <FormInput
            field={{
              label: 'Email',
              name: 'email',
              type: 'email',
              validationRules: { required: true },
            }}
            value={formState.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            errorMessage={errors.email || ''}
            showLabel={!!formState.email}
          />
          <FormInput
            field={{ label: 'Name', name: 'name', type: 'text' }}
            value={formState.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            errorMessage={errors.name || ''}
            showLabel={!!formState.name}
          />
          
          <div className="mt-l">
            <h3>Optional</h3>
            <p>
              Help us tailor your profile and provide insights based on surfers like you.
            </p>
            <LocationSelector
              locationData={locationData || []}
              selectedCountry={formState.country}
              selectedCity={formState.city}
              onCountryChange={(country) => handleChange('country', country)}
              onCityChange={(city) => handleChange('city', city)}
            />
            
            <div className="form-inline">
              <FormInput
                field={{
                  label: 'Age',
                  name: 'age',
                  type: 'number',
                  validationRules: { min: 0 },
                }}
                value={formState.age}
                onChange={(e) => handleChange('age', e.target.value.trim())}
                onBlur={() => handleBlur('age')}
                errorMessage={errors.age || ''}
                showLabel={!!formState.age}
                placeholder="Your age"
              />
              
              <FormInput
                field={{
                  label: 'Gender',
                  name: 'gender',
                  type: 'select',
                  options: GENDER_OPTIONS,
                }}
                value={formState.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                showLabel={!!formState.gender}
              />
            </div>
            
            <div className="form-inline">
              <FormInput
                field={{
                  label: getHeightLabel(settings.preferredUnits),
                  name: 'height',
                  type: settings.preferredUnits === 'metric' ? 'number' : 'text',
                  validationRules: settings.preferredUnits === 'metric' ? { min: 0 } : undefined,
                }}
                value={formState.height}
                onChange={(e) => handleChange('height', e.target.value.trim())}
                onBlur={() => handleBlur('height')}
                errorMessage={errors.height || ''}
                showLabel={!!formState.height}
                placeholder={settings.preferredUnits === 'metric' ? 'Your height (cm)' : 'Your height (e.g. 5\'10)'}
              />
              <FormInput
                field={{
                  label: getWeightLabel(settings.preferredUnits),
                  name: 'weight',
                  type: settings.preferredUnits === 'metric' ? 'number' : 'text',
                  validationRules: settings.preferredUnits === 'metric' ? { min: 0 } : undefined,
                }}
                value={formState.weight}
                onChange={(e) => handleChange('weight', e.target.value.trim())}
                onBlur={() => handleBlur('weight')}
                errorMessage={errors.weight || ''}
                showLabel={!!formState.weight}
                placeholder={settings.preferredUnits === 'metric' ? 'Your weight (kg)' : 'Your weight (e.g. 12st 5lbs)'}
              />
            </div>
            <input type="hidden" name="preferredUnits" value={settings.preferredUnits} />
            
            <FormInput
              field={{
                label: 'Skill Level',
                name: 'skillLevel',
                type: 'select',
                options: USER_SKILL_LEVEL_OPTIONS,
              }}
              value={formState.skillLevel}
              onChange={(e) => handleChange('skillLevel', e.target.value)}
              showLabel={!!formState.skillLevel}
            />
          </div>
          
          <div className="profile-links">
            <Link to="/skill-levels" prefetch="intent" className="text-link">
              What do these skill levels mean?
            </Link>
            <Link to="/data-policy" prefetch="intent" className="text-link">
              Learn more about our data policy
            </Link>
          </div>
        </FormComponent>
        <div className="mv">
          <NavButton
            label="Change Password"
            to="/auth/change-password"
            variant="secondary"
          />
        </div>
        <div className="mv">
          <div className="danger-zone">
            <h3>Impact Zone</h3>
            <p className="font-small">
              This will permanently delete all your data. This action cannot be
              undone.
            </p>
            <Button
              label="Delete Account"
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
            />
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <Modal onClose={() => setShowDeleteConfirm(false)}>
          <div className="delete-confirm-modal">
            <h2>Delete Your Account?</h2>
            <p>
              This will permanently delete your account and all your data,
              including trips, surfboards, watch lists, and profile information.
            </p>
            <p className="warning">
              This action cannot be undone.
            </p>
            {deleteFetcher.data?.hasError && (
              <p className="delete-error">
                {deleteFetcher.data.submitStatus}
              </p>
            )}
            <div className="modal-actions">
              <Button
                label="Delete Account"
                variant="danger"
                onClick={handleDeleteAccount}
                disabled={deleteFetcher.state === 'submitting'}
                loading={deleteFetcher.state === 'submitting'}
              />
              <Button
                label="Cancel"
                variant="cancel"
                onClick={() => {
                  setShowDeleteConfirm(false)
                }}
                disabled={deleteFetcher.state === 'submitting'}
              />
            </div>
          </div>
        </Modal>
      )}
    </Page>
  )
}

export default Profile
