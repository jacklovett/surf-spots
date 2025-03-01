import { data, redirect } from 'react-router'
import { AuthRequest, AuthUser, User } from '~/types/user'
import { getSession, commitSession } from '~/services/session.server'
import { post } from './networkService'
import { validateEmail, validatePassword } from '~/hooks/useFormValidation'
import { ApiResponse } from '~/types/apiResponse'

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

export const saveUserToBackend = async (profile: AuthUser): Promise<User> => {
  const user = await post<AuthUser, User>('user/profile', profile)
  if (!user) {
    throw new Error('Account could not be approved')
  }
  return user
}

const verifyLogin = async (email: string, password: string) => {
  const user = await post<AuthRequest, User>('user/login', {
    email: formatEmail(email),
    password,
    provider: 'EMAIL',
  })
  if (!user) {
    throw new Error('Invalid login credentials')
  }
  return user
}

export const registerUser = async (email: string, password: string) => {
  const response = await post<AuthRequest, ApiResponse>('user/register', {
    email: formatEmail(email),
    password,
    provider: 'EMAIL',
  })

  if (!response) {
    throw new Error('Failed to register user')
  }

  return response
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
