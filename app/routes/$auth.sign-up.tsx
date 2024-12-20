import {
  json,
  Link,
  redirect,
  useNavigate,
  useNavigation,
} from '@remix-run/react'
import { ActionFunctionArgs, MetaFunction } from '@remix-run/node'

import { registerUser, validate } from '~/services/auth.server'

import { Button, FormComponent, FormInput, Page } from '~/components'
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
    return json({ submitStatus: fieldErrors, hasErrors: true })
  }

  // Attempt user registration
  let submitError = ''
  try {
    const user = await registerUser(email, password)
    if (user) {
      return redirect('/auth')
    }

    submitError = 'Failed to register user'
  } catch (e) {
    submitError =
      e instanceof Error
        ? e.message
        : 'An unexpected error occurred. Please try again.'
  }

  return json({
    errors: { submitStatus: submitError, hasErrors: true },
  })
}

const SignUp = () => {
  const navigate = useNavigate()
  const { state } = useNavigation()
  const loading = state === 'loading'

  const submitStatus = useSubmitStatus()

  const { formState, errors, isFormValid, handleChange, handleBlur } =
    useFormValidation({
      initialFormState: { email: '', password: '' },
      validationFunctions: {
        email: validateEmail,
        password: validatePassword,
      },
    })

  return (
    <Page>
      <div className="center column mt">
        <img
          src="/images/png/logo-no-text.png"
          width="160"
          alt="Surf spots logo"
        />
        <div className="auth-title">
          <h1>Create an account</h1>
        </div>
        <div className="auth-container">
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
              onBlur={() => handleBlur('email')}
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
              onBlur={() => handleBlur('password')}
              errorMessage={errors.password || ''}
              showLabel={!!formState.password}
            />
          </FormComponent>

          <div className="sign-in-options mv">
            <div className="sign-in-providers-container">
              <div className="sign-in-providers">
                <Button
                  label=""
                  icon={{
                    name: 'Google',
                    filePath: '/images/png/google.png',
                  }}
                  onClick={() => navigate('/auth/google')}
                />
                <Button
                  label=""
                  icon={{
                    name: 'Facebook',
                    filePath: '/images/png/facebook.png',
                  }}
                  onClick={() => navigate('/auth/facebook')}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="row center auth-cta">
          <p>Already have an account? </p>
          <Link className="link" to="/auth">
            Sign in
          </Link>
        </div>
      </div>
    </Page>
  )
}

export default SignUp
