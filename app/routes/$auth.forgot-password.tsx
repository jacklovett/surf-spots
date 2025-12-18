import {
  ActionFunctionArgs,
  data,
  Link,
  MetaFunction,
  useNavigation,
} from 'react-router'

import { FormComponent, FormInput, Page } from '~/components'
import { post } from '~/services/networkService'
import { useFormValidation, useSubmitStatus } from '~/hooks'
import { validateEmail } from '~/hooks/useFormValidation'

export const meta: MetaFunction = () => {
  return [
    { title: 'Surf Spots - Forgot Password' },
    { name: 'description', content: 'Welcome to Surf Spots!' },
  ]
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const email = formData.get('email')?.toString() || ''

  // Validate input fields
  const emailError = validateEmail(email)
  // Early return if form validation error are present
  if (emailError) {
    return { submitStatus: emailError, hasError: true }
  }

  const { origin } = new URL(request.url)

  try {
    await post(
      `auth/forgot-password`,
      { email },
      {
        headers: {
          Origin: origin,
          'Content-Type': 'application/json',
        },
      },
    )
    return data(
      {
        submitStatus: 'Check your emails. Password reset instructions sent.',
      },
      { status: 200 },
    )
  } catch (e) {
    console.log(e)
    const submitError =
      e instanceof Error
        ? e.message
        : 'An unexpected error occurred. Please try again.'

    return {
      submitStatus: submitError,
      hasError: true,
    }
  }
}

const ForgotPassword = () => {
  const { state } = useNavigation()
  const loading = state === 'loading'

  const submitStatus = useSubmitStatus()

  const { formState, errors, isFormValid, handleChange } = useFormValidation({
    initialFormState: { email: '' },
    validationFunctions: {
      email: validateEmail,
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
          <h1>Forgot Password?</h1>
        </div>
        <div className="page-content center-text">
          <p>
            Don't worry, enter your email address to receive reset instructions.
          </p>
          <FormComponent
            isDisabled={!isFormValid}
            submitLabel="Send Reset Email"
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
          </FormComponent>
          <div className="mt center-horizontal font-small">
            <Link to="/auth" prefetch="intent">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </Page>
  )
}

export default ForgotPassword
