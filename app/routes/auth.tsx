import type { ActionFunction, MetaFunction } from '@remix-run/node'
import {
  json,
  Link,
  useActionData,
  useNavigate,
  useNavigation,
} from '@remix-run/react'
import { useState, ChangeEvent, FocusEvent, useEffect } from 'react'

import {
  AuthActionData,
  authenticator,
  AuthErrors,
  validate,
} from '~/services/auth.server'

import { Page, Button, FormComponent, FormInput } from '~/components'
import { inputElementType } from '~/components/FormInput'
import { AuthorizationError } from 'remix-auth'

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

  const errors = await validate(email, password)
  if (errors) {
    return json({ errors })
  }

  try {
    await authenticator.authenticate('form', request, {
      successRedirect: '/surf-spots',
      throwOnError: true,
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

  const handleChange = (e: ChangeEvent<inputElementType>) => {
    const { name, value } = e.target
    setFormState({ ...formState, [name]: value })
  }

  const handleBlur = (e: FocusEvent<inputElementType>) => {
    const { name } = e.target
    setTouchedFields({ ...touchedFields, [name]: true })
  }

  return (
    <Page>
      <div className="center column">
        <img src="/images/png/logo.png" width="160" alt="Surf spots logo" />
        <div className="auth-container">
          <FormComponent
            loading={loading}
            isDisabled={!isFormValid}
            submitLabel="Sign in"
            submitError={submitError}
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
              touched={touchedFields.email}
              errorMessage={emailError}
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
              touched={touchedFields.password}
              errorMessage={passwordError}
            />
          </FormComponent>
          <div className="sign-in-options">
            <div className="row flex-end">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
            <div className="sign-in-providers-container">
              <p>Or</p>
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
