import { type ActionFunction, type MetaFunction } from '@remix-run/node'
import {
  json,
  Link,
  redirect,
  useActionData,
  useNavigate,
  useNavigation,
} from '@remix-run/react'
import { AuthorizationError } from 'remix-auth'

import { AuthActionData, authenticator, validate } from '~/services/auth.server'
import { AuthPage, Button, FormComponent, FormInput } from '~/components'
import { commitSession, getSession } from '~/services/session.server'
import { useFormValidation } from '~/hooks'
import { validateEmail, validatePassword } from '~/hooks/useFormValidation'

export const meta: MetaFunction = () => [
  { title: 'Surf Spots - Sign in' },
  { name: 'description', content: 'Welcome to Surf Spots!' },
]

export const action: ActionFunction = async ({ request }) => {
  const clonedRequest = request.clone()
  const formData = await clonedRequest.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const errors = validate(email, password)

  if (errors) {
    return json({ errors })
  }

  try {
    const user = await authenticator.authenticate('form', request)
    if (!user) {
      return json(
        { errors: { submitError: 'Authentication failed' } },
        { status: 401 },
      )
    }

    const session = await getSession(request.headers.get('Cookie'))
    session.set('user', user)

    return redirect('/surf-spots', {
      headers: { 'Set-Cookie': await commitSession(session) },
    })
  } catch (error) {
    console.log('Error: ', error)
    if (error instanceof Response) {
      const { status, statusText } = error
      return json(
        {
          errors: {
            submitError: statusText
              ? statusText
              : `${status} Authentication failed`,
          },
        },
        { status: error.status },
      )
    }
    if (error instanceof AuthorizationError) {
      // Specific handling for authentication errors (e.g., invalid credentials)
      return json({ errors: { submitError: error.message } }, { status: 400 })
    }
    // Handle other unexpected errors
    return json(
      {
        errors: {
          submitError: 'An unexpected error occurred. Please try again.',
        },
      },
      { status: 500 },
    )
  }
}

export default function Auth() {
  const navigate = useNavigate()
  const { state } = useNavigation()
  const loading = state === 'loading'

  const actionData = useActionData<AuthActionData>() || {}
  const submitError = actionData.errors?.submitError

  const { formState, errors, isFormValid, handleChange, handleBlur } =
    useFormValidation({
      initialFormState: { email: '', password: '' },
      validationFunctions: {
        email: validateEmail,
        password: validatePassword,
      },
    })

  return (
    <AuthPage>
      <>
        <div className="auth-title">
          <h1>Sign in</h1>
        </div>
        <div className="auth-container">
          <FormComponent
            isDisabled={!isFormValid}
            submitLabel="Sign in"
            loading={loading}
            submitStatus={
              submitError ? { message: submitError, isError: true } : null
            }
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
          <div className="sign-in-options">
            <div className="row flex-end">
              <Link to="/auth/reset-password" prefetch="intent">
                Forgot password?
              </Link>
            </div>
            <div className="sign-in-providers-container border-top">
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
          <div className="row center auth-cta">
            <p>Don't have an account?</p>
            <Link to="/auth/sign-up" prefetch="intent">
              Sign up
            </Link>
          </div>
        </div>
      </>
    </AuthPage>
  )
}
