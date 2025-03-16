import {
  ActionFunction,
  data,
  Link,
  LoaderFunctionArgs,
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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const accountCreated = url.searchParams.get('accountCreated')
  if (accountCreated) {
    return {
      submitStatus: 'Account created successfully! Try signing in',
      hasError: false,
    }
  }
  return null
}

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
        <h1>Sign in</h1>
      </div>
      <div className="page-content mt">
        <FormComponent
          isDisabled={!isFormValid}
          submitLabel="Sign in"
          loading={loading}
          submitStatus={submitStatus}
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
            errorMessage={errors.email || ''}
            showLabel={!!formState.email}
          />
          <FormInput
            field={{
              label: 'Password',
              name: 'password',
              type: 'password',
              validationRules: { required: true, minLength: 8 },
            }}
            value={formState.password}
            onChange={(e) => handleChange('password', e.target.value)}
            errorMessage={errors.password || ''}
            showLabel={!!formState.password}
          />
        </FormComponent>
        <div className="auth-options">
          <div className="row flex-end">
            <Link to="/auth/forgot-password" prefetch="intent">
              Forgot password?
            </Link>
          </div>
          <SignInOptions />
        </div>
        <div className="row center auth-cta">
          <p>Don't have an account?</p>
          <Link to="/auth/sign-up" prefetch="intent">
            Sign up
          </Link>
        </div>
      </div>
    </AuthPage>
  )
}
