import { data, redirect } from 'react-router'
import { AuthRequest, User } from '~/types/user'
import { getSession, commitSession } from '~/services/session.server'
import { post } from './networkService'
import { validateEmail, validatePassword } from '~/hooks/useFormValidation'
import { ApiResponse } from '~/types/api'

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

  // Validate form inputs
  const errors = validate(email, password)
  if (errors) {
    return { errors }
  }

  try {
    const user = await verifyLogin(email, password)

    if (!user) {
      return data(
        {
          submitStatus: 'Authentication failed',
          hasError: true,
        },
        { status: 401 },
      )
    }

    return await setSessionCookieAndRedirect(request, user)
  } catch (error) {
    console.error('Login error:', error)
    return {
      submitStatus: 'Invalid login credentials',
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
    const response = await post<AuthRequest, ApiResponse<User>>('auth/login', {
      email: formatEmail(email),
      password,
      provider: 'EMAIL',
    })

    if (!response.data) {
      throw new Error(response.message || 'Invalid login credentials')
    }
    return response.data
  } catch (error) {
    console.error('Login API error:', error)
    if (error instanceof Error && error.message.includes('401')) {
      throw new Error('Invalid login credentials')
    }
    throw error
  }
}

export const registerUser = async (
  authRequest: AuthRequest,
  request: Request,
) => {
  try {
    const user = await post<AuthRequest, User>('auth/register', authRequest)
    if (!user) {
      throw new Error('Failed to register user')
    }
    return await setSessionCookieAndRedirect(request, user)
  } catch (error) {
    if (error instanceof Response) {
      const errorData = await error.json()
      throw new Error(errorData.message || 'Failed to register user')
    }
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to register user')
  }
}

export const validate = (email: string, password: string) => {
  const emailErrors = validateEmail(email)
  const passwordErrors = validatePassword(password)

  // Only include errors in the result if they exist
  const errors: AuthErrors = {}

  if (emailErrors) {
    errors.email = emailErrors
  }

  if (passwordErrors) {
    errors.password = passwordErrors
  }

  return Object.keys(errors).length ? errors : null
}

export const handleOAuthError = (
  error: unknown,
  provider: 'facebook' | 'google',
) => {
  console.error(`${provider} OAuth error:`, error)

  // Extract meaningful error message
  let errorMessage = `${provider} authentication failed`
  if (error instanceof Error) {
    if (
      provider === 'facebook' &&
      error.message.includes('Email is required')
    ) {
      errorMessage =
        'Email access is required. Please allow email access in Facebook settings and try again.'
    } else if (error.message.includes(`Failed to get ${provider} tokens`)) {
      errorMessage = `${provider} authentication failed. Please try again.`
    } else if (error.message.includes(`Failed to get ${provider} profile`)) {
      errorMessage = `Unable to retrieve your ${provider} profile. Please try again.`
    } else {
      errorMessage = error.message
    }
  }

  // Redirect to auth page with error message
  const searchParams = new URLSearchParams({
    error: provider,
    message: encodeURIComponent(errorMessage),
  })

  return redirect(`/auth?${searchParams.toString()}`)
}
