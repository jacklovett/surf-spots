import {
  ActionFunctionArgs,
  data,
  Link,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
  useLoaderData,
  useNavigation,
} from 'react-router'

import { ContentStatus, FormComponent, FormInput, Page } from '~/components'
import { post } from '~/services/networkService'
import { DEFAULT_ERROR_MESSAGE } from '~/utils/errorUtils'
import { useFormValidation, useSubmitStatus } from '~/hooks'
import { validatePassword } from '~/hooks/useFormValidation'

export const meta: MetaFunction = () => {
  return [
    { title: 'Surf Spots - Reset Password' },
    { name: 'description', content: 'Welcome to Surf Spots!' },
  ]
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return data(
      { submitStatus: 'Invalid or missing token', hasError: true },
      { status: 400 },
    )
  }

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

  const ResetPasswordRequest = { token, newPassword }

  try {
    await post(`auth/reset-password`, ResetPasswordRequest)
    return redirect('/auth?passwordReset=true')
  } catch (e) {
    const submitError =
      e instanceof Error
        ? e.message
        : DEFAULT_ERROR_MESSAGE

    return data(
      { submitStatus: submitError, hasError: true },
      { status: 500 },
    )
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  return { token }
}

const ResetPassword = () => {
  const { token } = useLoaderData<typeof loader>()
  const { state } = useNavigation()
  const loading = state === 'loading'

  const { formState, errors, isFormValid, handleChange } = useFormValidation({
    initialFormState: {
      newPassword: '',
      repeatedNewPassword: '',
    },
    validationFunctions: {
      newPassword: validatePassword,
      repeatedNewPassword: validatePassword,
    },
  })

  const submitStatus = useSubmitStatus()

  return (
    <Page>
      <div className="center column mt">
        <img
          src="/images/png/logo-no-text.png"
          width="160"
          alt="Surf spots logo"
        />
        {!token && (
          <div className="center-text">
            <ContentStatus isError>
              <p className="bold">
                This password reset attempt is no longer valid.
              </p>
              <p>For your security, please request a new password reset.</p>
              <div className="mt">
                <Link to="/auth/forgot-password" className="button">
                  Request New Link
                </Link>
              </div>
            </ContentStatus>
          </div>
        )}
        {token && (
          <>
            <div className="auth-title">
              <h1>Reset Password</h1>
            </div>
            <div className="page-content">
              <FormComponent
                isDisabled={!isFormValid}
                submitStatus={submitStatus}
                method="put"
              >
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
                <Link to="/auth" prefetch="intent">
                  Back to login
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </Page>
  )
}

export default ResetPassword
