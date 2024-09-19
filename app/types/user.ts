export const usersEndpoint = 'api/users'

export interface AuthRequest {
  username: string
  password: string
}

export interface UserProfile {
  username: string
  name: string
  email: string
  country: string
  region: string
}

export interface User {
  id: string
  isAuthenticated: boolean
  username: string
  name: string
  email: string
  country: string
  region: string
}
