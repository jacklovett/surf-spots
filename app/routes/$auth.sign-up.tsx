import { useState, useEffect, ChangeEvent, FocusEvent } from 'react'
import { json, Link, redirect, useActionData } from '@remix-run/react'
import { ActionFunctionArgs } from '@remix-run/node'

import {
  AuthActionData,
  AuthErrors,
  registerUser,
  validate,
} from '~/services/auth.server'

import { FormComponent, FormInput, Page } from '~/components'
import { InputElementType } from '~/components/FormInput'

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const email = formData.get('email')?.toString() || ''
  const password = formData.get('password')?.toString() || ''

  // Validate input fields
  const fieldErrors = validate(email, password)
  // Early return if fieldErrors are present
  if (fieldErrors) {
    return json({ errors: fieldErrors })
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
    errors: { submitError }, // Only return submissionError if no field errors
  })
}

const SignUp = () => {
  const actionData = useActionData<AuthActionData>()
  const errors: AuthErrors = actionData?.errors || {}
  const { email: emailError, password: passwordError, submitError } = errors

  const [formState, setFormState] = useState({ email: '', password: '' })
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    password: false,
  })
  const [isFormValid, setIsFormValid] = useState(false)

  useEffect(() => {
    setIsFormValid(
      touchedFields.email &&
        touchedFields.password &&
        !!formState.email &&
        !!formState.password,
    )
  }, [formState, touchedFields])

  const handleChange = (e: ChangeEvent<InputElementType>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value })
  }

  const handleBlur = (e: FocusEvent<InputElementType>) => {
    setTouchedFields({ ...touchedFields, [e.target.name]: true })
  }

  return (
    <Page>
      <div className="center-vertical column">
        <div className="center column auth-container">
          <img
            src="/images/png/logo-no-text.png"
            width="160"
            alt="Surf spots logo"
          />
          <div className="auth-title">
            <h1>Create an account</h1>
          </div>
          <FormComponent
            loading={false}
            isDisabled={!isFormValid}
            submitLabel="Sign up"
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
            />
          </FormComponent>
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
