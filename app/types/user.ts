export const usersEndpoint = 'api/users'

export type AuthProvider = 'EMAIL' | 'FACEBOOK' | 'GOOGLE'

export interface AuthRequest {
  email: string
  password: string
  provider: AuthProvider
}

export interface User extends AuthUser {
  id: string
  username: string
  country: string
  region: string
}

export interface AuthUser {
  providerId?: string
  provider: AuthProvider
  name: string
  email: string
}
