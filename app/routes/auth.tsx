import {
  ActionFunction,
  data,
  Link,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from 'react-router'
import { authenticateWithCredentials, validate } from '~/services/auth.server'
import { AuthPage, FormComponent, FormInput, SignInOptions } from '~/components'
import { getDisplayMessage } from '~/services/networkService'
import {
  DEFAULT_ERROR_MESSAGE,
  ERROR_CREDENTIALS_DONT_MATCH,
  ERROR_SIGN_IN,
  ERROR_VALIDATION_FIX,
  SUCCESS_PASSWORD_RESET,
  SUCCESS_EMAIL_VERIFIED,
  ERROR_VERIFY_EMAIL_LINK_INVALID,
  ERROR_VERIFY_EMAIL_LINK_MISSING,
  ERROR_VERIFY_EMAIL_RATE_LIMIT,
  ERROR_VERIFY_EMAIL_SERVER,
  messageForDisplay,
} from '~/utils/errorUtils'

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

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const errorParam = url.searchParams.get('error')
  const messageParam = url.searchParams.get('message')
  const passwordReset = url.searchParams.get('passwordReset')

  if (errorParam && messageParam) {
    const errorMessage = messageForDisplay(messageParam.trim(), DEFAULT_ERROR_MESSAGE)
    return data({
      submitStatus: errorMessage,
      hasError: true,
    })
  }

  if (passwordReset === 'true') {
    return data({
      submitStatus: SUCCESS_PASSWORD_RESET,
      hasError: false,
    })
  }

  const verifiedParam = url.searchParams.get('verified')
  const emailJustVerified =
    verifiedParam === 'true' ||
    (url.searchParams.has('verified') && verifiedParam === '')

  if (emailJustVerified) {
    return data({
      submitStatus: SUCCESS_EMAIL_VERIFIED,
      hasError: false,
    })
  }

  const verifyError = url.searchParams.get('verifyError')
  if (verifyError === 'missing') {
    return data({
      submitStatus: ERROR_VERIFY_EMAIL_LINK_MISSING,
      hasError: true,
    })
  }

  if (verifyError === 'invalid') {
    return data({
      submitStatus: ERROR_VERIFY_EMAIL_LINK_INVALID,
      hasError: true,
    })
  }

  if (verifyError === 'rate_limit') {
    return data({
      submitStatus: ERROR_VERIFY_EMAIL_RATE_LIMIT,
      hasError: true,
    })
  }

  if (verifyError === 'server') {
    return data({
      submitStatus: ERROR_VERIFY_EMAIL_SERVER,
      hasError: true,
    })
  }

  return data(null)
}

export const action: ActionFunction = async ({ request }) => {
  const clonedRequest = request.clone()
  const formData = await clonedRequest.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const errors = validate(email, password)

  if (errors) {
    const errorMessage =
      errors.email || errors.password || ERROR_VALIDATION_FIX
    return data(
      { submitStatus: errorMessage, hasError: true },
      { status: 400 },
    )
  }

  try {
    return await authenticateWithCredentials(request)
  } catch (error) {
    console.log('Error: ', error)
    if (error instanceof Response) {
      const { status } = error
      return data(
        {
          submitStatus:
            status === 401 ? ERROR_CREDENTIALS_DONT_MATCH : DEFAULT_ERROR_MESSAGE,
          hasError: true,
        },
        { status },
      )
    }
    const status =
      error instanceof Error && 'status' in error
        ? (error as { status?: number }).status ?? 500
        : 500
    const message = getDisplayMessage(error, ERROR_SIGN_IN)
    return data(
      { submitStatus: message, hasError: true },
      { status },
    )
  }
}

export default function Auth() {
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
            onChange={(event) => handleChange('email', event.target.value)}
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
            onChange={(event) => handleChange('password', event.target.value)}
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
