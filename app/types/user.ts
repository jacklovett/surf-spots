export const usersEndpoint = 'api/users'

export type AuthProvider = 'EMAIL' | 'FACEBOOK' | 'GOOGLE'

export interface AuthRequest {
  username: string
  password: string
}

export interface User extends AuthUser {
  id: string
  username: string
  country: string
  region: string
}

export interface AuthUser {
  providerId: string
  provider: AuthProvider
  name: string
  email: string
}
