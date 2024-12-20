import {
  json,
  Link,
  MetaFunction,
  useLoaderData,
  useNavigate,
  useNavigation,
} from '@remix-run/react'
import { ActionFunction, LoaderFunction } from '@remix-run/node'
import { useEffect, useState } from 'react'
import fs from 'fs/promises'
import path from 'path'

import { edit } from '~/services/networkService'
import {
  commitSession,
  getSession,
  requireSessionCookie,
} from '~/services/session.server'
import { useUser } from '~/contexts/UserContext'

import {
  ContentStatus,
  Page,
  FormInput,
  FormComponent,
  Button,
  LocationSelector,
} from '~/components'
import { Location } from '~/components/LocationSelector'
import { useFormValidation, useSubmitStatus } from '~/hooks'
import { validateEmail } from '~/hooks/useFormValidation'

interface LoaderData {
  data?: Location[]
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
    const data = JSON.parse(fileData)
    return json(
      { data },
      {
        headers: {
          'Cache-Control':
            'public, max-age=86400, stale-while-revalidate=31536000',
        },
      },
    )
  } catch (error) {
    console.error(error)
    return json({
      error: 'Unable to populate location drop-down menus',
    })
  }
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()

  const name = formData.get('name')?.toString() || ''
  const country = formData.get('country')?.toString() || ''
  const city = formData.get('city')?.toString() || ''

  const session = await getSession(request.headers.get('Cookie'))
  const user = session.get('user')

  const updateUser = {
    ...user,
    name,
    country,
    city,
  }

  try {
    await edit('user/update/profile', updateUser, {
      headers: {
        Cookie: `${request.headers.get('Cookie')}`,
      },
    })

    session.set('user', updateUser)

    return json(
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
    return json(
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
  const { user } = useUser()
  const navigate = useNavigate()
  const { state } = useNavigation()
  const loading = state === 'loading'

  const { data, error } = useLoaderData<LoaderData>()

  const submitStatus = useSubmitStatus()

  const {
    formState,
    errors,
    isFormValid,
    handleChange,
    handleBlur,
    setFormState,
  } = useFormValidation({
    initialFormState: {
      country: user?.country || '',
      email: user?.email || '',
      name: user?.name || '',
      city: user?.city || '',
    },
    validationFunctions: {
      email: validateEmail,
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
      <div className="column center-vertical mv">
        <div className="auth-container">
          <h1 className="mt">Profile</h1>
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
              showLabel={!!formState.name}
            />
            <LocationSelector
              locationData={data || []}
              selectedCountry={formState.country}
              selectedCity={formState.city}
              onCountryChange={(country) =>
                setFormState((prev) => ({ ...prev, country, region: '' }))
              }
              onCityChange={(city) =>
                setFormState((prev) => ({ ...prev, city }))
              }
            />
            <div className="row flex-end disclaimer">
              <Link to="/data-policy">Why do we want this information?</Link>
            </div>
          </FormComponent>
          <div className="mv">
            <Button
              label="Change Password"
              onClick={() => navigate('/auth/change-password')}
              variant="secondary"
            />
          </div>
        </div>
      </div>
    </Page>
  )
}

export default Profile
