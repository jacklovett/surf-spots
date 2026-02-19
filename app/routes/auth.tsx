import {
  ActionFunction,
  data,
  Link,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from 'react-router'
import { authenticateWithCredentials, validate } from '~/services/auth.server'
import { AuthPage, FormComponent, FormInput, SignInOptions } from '~/components'
import { getDisplayMessage } from '~/services/networkService'
import { DEFAULT_ERROR_MESSAGE } from '~/utils/errorUtils'

import { useFormValidation, useSubmitStatus } from '~/hooks'
import { validateEmail, validatePassword } from '~/hooks/useFormValidation'

export const meta: MetaFunction = () => [
  { title: 'Surf Spots - Sign in' },
  { name: 'description', content: 'Welcome to Surf Spots!' },
]

export const links: LinksFunction = () => [
  {
    rel: 'preload',
    href: '/images/png/logo.png',
    as: 'image',
    type: 'image/png',
  },
]

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const errorParam = url.searchParams.get('error')
  const messageParam = url.searchParams.get('message')
  const passwordReset = url.searchParams.get('passwordReset')

  if (errorParam && messageParam) {
    const errorMessage = decodeURIComponent(messageParam)
    // Return error data - URL cleanup will happen in component
    return data({
      submitStatus: errorMessage,
      hasError: true,
    })
  }

  if (passwordReset === 'true') {
    return data({
      submitStatus: 'Password reset successful. Please sign in with your new password.',
      hasError: false,
    })
  }

  return data(null)
}

export const action: ActionFunction = async ({ request }) => {
  const clonedRequest = request.clone()
  const formData = await clonedRequest.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const errors = validate(email, password)

  if (errors) {
    // Return validation errors as submitStatus for inline form display
    const errorMessage = errors.email || errors.password || 'Please fix the errors above'
    return data(
      { submitStatus: errorMessage, hasError: true },
      { status: 400 },
    )
  }

  try {
    return await authenticateWithCredentials(request)
  } catch (error) {
    console.log('Error: ', error)
    if (error instanceof Response) {
      const { status } = error
      return data(
        {
          submitStatus:
            status === 401
              ? "That email and password didn't match. Try again or use Forgot password."
              : DEFAULT_ERROR_MESSAGE,
          hasError: true,
        },
        { status },
      )
    }
    const status =
      error instanceof Error && 'status' in error
        ? (error as { status?: number }).status ?? 500
        : 500
    const message = getDisplayMessage(error)
    return data(
      { submitStatus: message, hasError: true },
      { status },
    )
  }
}

export default function Auth() {
  // useSubmitStatus already handles both actionData and loaderData
  const submitStatus = useSubmitStatus()

  const { formState, errors, isFormValid, handleChange } = useFormValidation({
    initialFormState: { email: '', password: '' },
    validationFunctions: {
      email: validateEmail,
      password: validatePassword,
    },
  })

  return (
    <AuthPage>
      <div className="auth-title">
        <h1>Sign In</h1>
      </div>
      <div className="page-content mt">
        <FormComponent
          isDisabled={!isFormValid}
          submitLabel="Sign in"
          submitStatus={submitStatus}
        >
          <FormInput
            field={{
              label: 'Email',
              name: 'email',
              type: 'email',
            }}
            value={formState.email}
            onChange={(e) => handleChange('email', e.target.value)}
            errorMessage={errors.email || ''}
            showLabel={!!formState.email}
          />
          <FormInput
            field={{
              label: 'Password',
              name: 'password',
              type: 'password',
            }}
            value={formState.password}
            onChange={(e) => handleChange('password', e.target.value)}
            errorMessage={errors.password || ''}
            showLabel={!!formState.password}
          />
        </FormComponent>
        <div className="auth-options">
          <div className="row flex-end mt-s">
            <Link to="/auth/forgot-password" prefetch="intent">
              Forgot password?
            </Link>
          </div>
          <SignInOptions />
        </div>
        <div className="center auth-options">
          <div className="auth-cta">
            <p>Don't have an account?</p>
            <Link className="font-small" to="/auth/sign-up" prefetch="intent">
              Sign up
            </Link>
          </div>
          <Link className="guest-link" to="/surf-spots" prefetch="intent">
            Explore as Guest
          </Link>
        </div>
      </div>
    </AuthPage>
  )
}
