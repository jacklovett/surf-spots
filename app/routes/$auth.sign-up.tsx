import { useEffect } from 'react'
import {
  ActionFunctionArgs,
  Link,
  MetaFunction,
  redirect,
  useNavigation,
} from 'react-router'

import { registerUser, validate } from '~/services/auth.server'

import { AuthPage, FormComponent, FormInput, SignInOptions } from '~/components'
import { useFormValidation, useSubmitStatus } from '~/hooks'
import { validateEmail, validatePassword } from '~/hooks/useFormValidation'

export const meta: MetaFunction = () => {
  return [
    { title: 'Surf Spots - Sign Up' },
    { name: 'description', content: 'Welcome to Surf Spots!' },
  ]
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const email = formData.get('email')?.toString() || ''
  const password = formData.get('password')?.toString() || ''

  // Validate input fields
  const fieldErrors = validate(email, password)
  // Early return if fieldErrors are present
  if (fieldErrors) {
    return { submitStatus: fieldErrors, hasError: true }
  }

  // Attempt user registration
  let submitError = ''
  try {
    const response = await registerUser(email, password)
    if (response) {
      return redirect('/auth?accountCreated=true')
    }

    submitError = 'Failed to register user'
  } catch (e) {
    submitError =
      e instanceof Error
        ? e.message
        : 'An unexpected error occurred. Please try again.'
  }

  return { submitStatus: submitError, hasError: true }
}

const SignUp = () => {
  const { state } = useNavigation()
  const loading = state === 'loading'

  const submitStatus = useSubmitStatus()

  // Remove any present modals
  useEffect(() => {
    const modalOverlay = document.querySelector('.modal-overlay')
    if (modalOverlay) {
      modalOverlay.remove()
    }
  }, [])

  const { formState, errors, isFormValid, handleChange } = useFormValidation({
    initialFormState: { email: '', password: '' },
    validationFunctions: {
      email: validateEmail,
      password: validatePassword,
    },
  })

  return (
    <AuthPage reversed>
      <div className="auth-title">
        <h1>Create an Account</h1>
      </div>
      <div className="page-content">
        <FormComponent
          loading={loading}
          isDisabled={!isFormValid}
          submitLabel="Sign up"
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
            errorMessage={errors.email}
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
          <SignInOptions />
        </div>
        <div className="center auth-options">
          <div className="row center auth-cta">
            <p>Already have an account?</p>
            <Link className="font-small" to="/auth" prefetch="intent">
              Sign in
            </Link>
          </div>
          <Link className="font-small" to="/surf-spots" prefetch="intent">
            Continue as Guest
          </Link>
        </div>
      </div>
    </AuthPage>
  )
}

export default SignUp
