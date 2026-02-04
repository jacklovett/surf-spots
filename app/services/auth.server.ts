import { data, redirect } from 'react-router'
import { AuthRequest, User } from '~/types/user'
import { getSession, commitSession } from '~/services/session.server'
import { post, isNetworkError } from './networkService'
import { messageForDisplay } from '~/utils/errorUtils'
import { validateEmail, validatePassword } from '~/hooks/useFormValidation'

export interface AuthErrors {
  email?: string
  password?: string
  submitError?: string
}

export interface AuthActionData {
  errors?: AuthErrors
}

export const formatEmail = (email: string) => email.toLowerCase().trim()

export type SessionUser = {
  id: string
  email: string
  displayName: string
}

export const authenticateWithCredentials = async (request: Request) => {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const errors = validate(email, password)
  if (errors) {
    return { errors }
  }

  try {
    const user = await verifyLogin(email, password)
    if (!user) {
      return data(
        {
          submitStatus:
            "That email and password didn't match. Try again or use Forgot password.",
          hasError: true,
        },
        { status: 401 },
      )
    }

    return await setSessionCookieAndRedirect(request, user)
  } catch (error) {
    console.error('Login error:', error)

    if (isNetworkError(error) && error.status !== undefined) {
      const status = error.status
      if (status === 401 || status === 404) {
        return {
          submitStatus:
            "That email and password didn't match. Try again or use Forgot password.",
          hasError: true,
        }
      }
      if (status === 403) {
        return {
          submitStatus:
            "This account can't sign in. Contact support if you need help.",
          hasError: true,
        }
      }
    }

    return {
      submitStatus: 'Unable to sign in. Please try again.',
      hasError: true,
    }
  }
}

export const setSessionCookieAndRedirect = async (
  request: Request,
  user: User,
) => {
  const session = await getSession(request.headers.get('Cookie'))
  session.set('user', user)
  const cookie = await commitSession(session)

  if (cookie) {
    return redirect('/surf-spots', {
      headers: {
        'Set-Cookie': cookie,
      },
    })
  } else {
    throw new Error('Failed to set session cookie')
  }
}

export const verifyLogin = async (email: string, password: string) => {
  try {
    // The networkService extracts data.data from ApiResponse, so we get User directly
    const user = await post<AuthRequest, User>('auth/login', {
      email: formatEmail(email),
      password,
      provider: 'EMAIL',
    })

    if (!user || !user.id) {
      throw new Error(
        "That email and password didn't match. Try again or use Forgot password.",
      )
    }
    return user
  } catch (error) {
    throw error
  }
}

export const registerUser = async (
  authRequest: AuthRequest,
  request: Request,
) => {
  const user = await post<AuthRequest, User>('auth/register', authRequest)
  if (!user) {
    throw new Error('Failed to register user')
  }
  return await setSessionCookieAndRedirect(request, user)
}

export const validate = (email: string, password: string) => {
  const errors: AuthErrors = {}
  const emailError = validateEmail(email)
  const passwordError = validatePassword(password)

  if (emailError) errors.email = emailError
  if (passwordError) errors.password = passwordError

  return Object.keys(errors).length ? errors : null
}

export const handleOAuthError = (
  error: unknown,
  provider: 'facebook' | 'google',
) => {
  console.error(`${provider} OAuth error:`, error)

  const fallback = 'Sign in failed. Please try again.'
  let errorMessage = fallback

  if (error instanceof Error) {
    if (isNetworkError(error)) {
      errorMessage = messageForDisplay(error.message, fallback)
    } else if (
      provider === 'facebook' &&
      error.message.includes('Email is required')
    ) {
      errorMessage =
        'Email access is required. Please allow email access in Facebook settings and try again.'
    } else if (error.message.includes(`Failed to get ${provider} profile`)) {
      errorMessage = 'Unable to retrieve your profile. Please try again.'
    }
  }

  const searchParams = new URLSearchParams({
    error: provider,
    message: encodeURIComponent(errorMessage),
  })

  return redirect(`/auth?${searchParams.toString()}`)
}
