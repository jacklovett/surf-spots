import {
  ActionFunctionArgs,
  MetaFunction,
  data,
  Link,
  redirect,
  useNavigation,
} from 'react-router'

import { FormComponent, FormInput, Page } from '~/components'
import { edit } from '~/services/networkService'
import { getSession, requireSessionCookie } from '~/services/session.server'
import { useFormValidation, useSubmitStatus } from '~/hooks'
import { validatePassword } from '~/hooks/useFormValidation'

export const meta: MetaFunction = () => {
  return [
    { title: 'Surf Spots - Change Password' },
    { name: 'description', content: 'Welcome to Surf Spots!' },
  ]
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const cookie = request.headers.get('Cookie')

  if (!cookie) {
    console.log('No session cookie found, redirecting to sign in')
    throw redirect('/auth')
  }

  await requireSessionCookie(request)

  const session = await getSession(cookie)
  const user = session.get('user')
  const userId = user?.id

  const formData = await request.formData()

  const currentPassword = formData.get('currentPassword')?.toString() || ''
  const newPassword = formData.get('newPassword')?.toString() || ''
  const repeatedNewPassword =
    formData.get('repeatedNewPassword')?.toString() || ''

  // Validate input fields
  if (newPassword !== repeatedNewPassword) {
    return data(
      { submitStatus: 'New passwords do not match!', hasError: true },
      { status: 400 },
    )
  }

  const changePasswordRequest = { userId, currentPassword, newPassword }

  try {
    await edit(`user/update-password`, changePasswordRequest, {
      headers: {
        Cookie: `${cookie}`,
      },
    })

    return data(
      { submitStatus: 'Password updated successfully' },
      { status: 200 },
    )
  } catch (e) {
    const submitError =
      e instanceof Error
        ? e.message
        : 'An unexpected error occurred. Please try again.'

    return data(
      { submitStatus: submitError, hasError: true },
      { status: 500 },
    )
  }
}

const ChangePassword = () => {
  const { state } = useNavigation()
  const loading = state === 'loading'

  const { formState, errors, isFormValid, handleChange } = useFormValidation({
    initialFormState: {
      currentPassword: '',
      newPassword: '',
      repeatedNewPassword: '',
    },
    validationFunctions: {
      currentPassword: validatePassword,
      newPassword: validatePassword,
      repeatedNewPassword: validatePassword,
    },
  })

  const submitStatus = useSubmitStatus()

  return (
    <Page showHeader>
      <div className="info-page-content mv">
        <h1 className="mt">Change Password</h1>
        <FormComponent
          isDisabled={!isFormValid}
          submitStatus={submitStatus}
          method="put"
        >
          <FormInput
            field={{
              label: 'Current Password',
              name: 'currentPassword',
              type: 'password',
              validationRules: { required: true, minLength: 8 },
            }}
            value={formState.currentPassword}
            onChange={(e) => handleChange('currentPassword', e.target.value)}
            errorMessage={errors.currentPassword || ''}
            showLabel={!!formState.currentPassword}
          />
          <FormInput
            field={{
              label: 'New Password',
              name: 'newPassword',
              type: 'password',
              validationRules: { required: true, minLength: 8 },
            }}
            value={formState.newPassword}
            onChange={(e) => handleChange('newPassword', e.target.value)}
            errorMessage={errors.newPassword || ''}
            showLabel={!!formState.newPassword}
          />
          <FormInput
            field={{
              label: 'Repeat New Password',
              name: 'repeatedNewPassword',
              type: 'password',
              validationRules: { required: true, minLength: 8 },
            }}
            value={formState.repeatedNewPassword}
            onChange={(e) =>
              handleChange('repeatedNewPassword', e.target.value)
            }
            errorMessage={errors.repeatedNewPassword || ''}
            showLabel={!!formState.repeatedNewPassword}
          />
        </FormComponent>
        <div className="mv center-horizontal">
          <Link to="/profile" prefetch="intent">
            Back to profile
          </Link>
        </div>
      </div>
    </Page>
  )
}

export default ChangePassword
