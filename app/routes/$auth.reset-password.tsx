import { json, Link, useNavigation } from '@remix-run/react'
import { ActionFunctionArgs, MetaFunction } from '@remix-run/node'

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
    return json({ submitStatus: emailError, hasError: true })
  }

  try {
    await post(`/email-reset`, email)
    return json(
      {
        submitStatus: 'Check your emails. Password reset instructions sent.',
      },
      { status: 200 },
    )
  } catch (e) {
    const submitError =
      e instanceof Error
        ? e.message
        : 'An unexpected error occurred. Please try again.'

    return json({
      submitStatus: submitError,
      hasError: true,
    })
  }
}

const ResetPassword = () => {
  const { state } = useNavigation()
  const loading = state === 'loading'

  const submitStatus = useSubmitStatus()

  const { formState, errors, isFormValid, handleChange, handleBlur } =
    useFormValidation({
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
          <h1>Reset Password</h1>
        </div>
        <div className="auth-container">
          <FormComponent
            loading={loading}
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
              onBlur={() => handleBlur('email')}
              errorMessage={errors.email || ''}
              showLabel={!!formState.email}
            />
          </FormComponent>
          <div className="mv center-horizontal">
            <Link to="/auth" prefetch="intent">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </Page>
  )
}

export default ResetPassword
