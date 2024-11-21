import { type ActionFunction, type MetaFunction } from '@remix-run/node'
import {
  json,
  Link,
  redirect,
  useActionData,
  useNavigate,
  useNavigation,
} from '@remix-run/react'
import { useState, ChangeEvent, FocusEvent, useEffect } from 'react'
import { AuthorizationError } from 'remix-auth'

import {
  AuthActionData,
  authenticator,
  AuthErrors,
  validate,
} from '~/services/auth.server'

import { Page, Button, FormComponent, FormInput } from '~/components'
import { InputElementType } from '~/components/FormInput'
import { commitSession, getSession } from '~/services/session.server'

export const meta: MetaFunction = () => {
  return [
    { title: 'Surf Spots - Sign in' },
    { name: 'description', content: 'Welcome to Surf Spots!' },
  ]
}

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
      return json({ error: 'Authentication failed' }, { status: 401 })
    }

    const session = await getSession(request.headers.get('Cookie'))
    // Store user information in the session
    session.set('user', user)

    return redirect('/surf-spots', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    })
  } catch (error) {
    console.log(error)
    if (error instanceof Response) return error // Handles redirection-related errors
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

  const actionData = useActionData<AuthActionData>()

  const errors: AuthErrors = actionData?.errors || {}
  const { email: emailError, password: passwordError, submitError } = errors

  const [formState, setFormState] = useState({
    email: '',
    password: '',
  })
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    password: false,
  })

  const [isFormValid, setIsFormValid] = useState(false)

  useEffect(() => {
    if (isFormValid && (emailError || passwordError || submitError)) {
      setIsFormValid(false)
      setTouchedFields({ email: false, password: false })
    }

    if (
      (touchedFields.email || touchedFields.password) &&
      !!formState.email &&
      !!formState.password
    ) {
      setIsFormValid(true)
    }
  }, [formState, touchedFields, errors])

  const handleChange = (e: ChangeEvent<InputElementType>) => {
    const { name, value } = e.target
    setFormState({ ...formState, [name]: value })
  }

  const handleBlur = (e: FocusEvent<InputElementType>) => {
    const { name } = e.target
    setTouchedFields({ ...touchedFields, [name]: true })
  }

  return (
    <Page>
      <div className="center column mt">
        <img
          src="/images/png/logo-no-text.png"
          width="120"
          alt="Surf spots logo"
        />
        <div className="auth-title">
          <h1>Sign in</h1>
        </div>
        <div className="auth-container">
          <FormComponent
            loading={loading}
            isDisabled={!isFormValid}
            submitLabel="Sign in"
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
              onChange={handleChange}
              onBlur={handleBlur}
              errorMessage={emailError}
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
              onChange={handleChange}
              onBlur={handleBlur}
              errorMessage={passwordError}
              showLabel={!!formState.password}
            />
          </FormComponent>
          <div className="sign-in-options">
            <div className="row flex-end">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
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
          <div className="row center mt auth-cta">
            <p>Don't have an account?</p>
            <Link to={'/auth/sign-up'}>Sign up</Link>
          </div>
        </div>
      </div>
    </Page>
  )
}
