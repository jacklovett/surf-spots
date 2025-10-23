import { useEffect, useState } from 'react'
import {
  ActionFunction,
  data,
  Link,
  LoaderFunction,
  MetaFunction,
  useLoaderData,
  useNavigation,
} from 'react-router'
import fs from 'fs/promises'
import path from 'path'

import { cacheControlHeader, edit } from '~/services/networkService'
import {
  commitSession,
  getSession,
  requireSessionCookie,
} from '~/services/session.server'
import { useUserContext } from '~/contexts'

import {
  ContentStatus,
  Page,
  FormInput,
  FormComponent,
  LocationSelector,
  NavButton,
} from '~/components'
import { Location } from '~/components/LocationSelector'
import { useFormValidation, useSubmitStatus } from '~/hooks'
import { validateEmail, validateRequired } from '~/hooks/useFormValidation'

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

  const name = formData.get('name')?.toString() || ''
  const country = formData.get('country')?.toString() || ''
  const city = formData.get('city')?.toString() || ''

  const user = await requireSessionCookie(request)

  const updateUser = {
    ...user,
    name,
    country,
    city,
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
  const { state } = useNavigation()
  const loading = state === 'loading'

  const { locationData = [], error } = useLoaderData<LoaderData>()

  const submitStatus = useSubmitStatus()

  const { formState, errors, isFormValid, handleChange, handleBlur } =
    useFormValidation({
      initialFormState: {
        country: user?.country || '',
        email: user?.email || '',
        name: user?.name || '',
        city: user?.city || '',
      },
      validationFunctions: {
        email: validateEmail,
        name: (value) => validateRequired(value, 'Name'),
      },
    })

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(
    () =>
      setHasUnsavedChanges(
        formState.country !== (user?.country ?? '') ||
          formState.city !== (user?.city ?? '') ||
          formState.name !== (user?.name ?? ''),
      ),
    [formState, user],
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
    <Page showHeader>
      <div className="profile-page">
        <h1>Profile</h1>
        <FormComponent
          loading={loading}
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
          <LocationSelector
            locationData={locationData || []}
            selectedCountry={formState.country}
            selectedCity={formState.city}
            onCountryChange={(country) => handleChange('country', country)}
            onCityChange={(city) => handleChange('city', city)}
          />
          <div className="row flex-end disclaimer">
            <Link to="/data-policy" prefetch="intent">
              Why do we want this information?
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
      </div>
    </Page>
  )
}

export default Profile
