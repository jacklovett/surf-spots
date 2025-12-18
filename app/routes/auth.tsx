import {
  ActionFunction,
  data,
  Link,
  LinksFunction,
  MetaFunction,
  useNavigation,
} from 'react-router'
import { authenticateWithCredentials, validate } from '~/services/auth.server'
import { AuthPage, FormComponent, FormInput, SignInOptions } from '~/components'

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

export const action: ActionFunction = async ({ request }) => {
  const clonedRequest = request.clone()
  const formData = await clonedRequest.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const errors = validate(email, password)

  if (errors) {
    return { errors }
  }

  try {
    return await authenticateWithCredentials(request)
  } catch (error) {
    console.log('Error: ', error)
    if (error instanceof Response) {
      const { status, statusText } = error
      return data(
        {
          submitStatus: statusText || `${status} Authentication failed`,
          hasError: true,
        },
        { status },
      )
    }
    if (error instanceof Error && error.message === 'Invalid credentials') {
      // Specific handling for authentication errors (e.g., invalid credentials)
      return data(
        { submitStatus: error.message, hasError: true },
        { status: 400 },
      )
    }
    // Handle other unexpected errors
    return data(
      {
        submitStatus: 'An unexpected error occurred. Please try again.',
        hasError: true,
      },
      { status: 500 },
    )
  }
}

export default function Auth() {
  const { state } = useNavigation()
  const loading = state === 'loading'

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
