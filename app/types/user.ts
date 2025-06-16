export const usersEndpoint = 'api/users'

export type AuthProvider = 'EMAIL' | 'FACEBOOK' | 'GOOGLE'

export interface AuthRequest {
  email: string
  password?: string
  provider: AuthProvider
  name?: string
  providerId?: string
}

export interface User extends AuthUser {
  id: string
  country?: string
  city?: string
  settings?: UserSettings
}

export interface AuthUser {
  providerId?: string
  provider: AuthProvider
  name: string
  email: string
}

export interface ProfileState {
  country: string
  email: string
  name: string
  city: string
}

export interface UserSettings {
  newSurfSpotEmails: boolean
  nearbySurfSpotsEmails: boolean
  swellSeasonEmails: boolean
  eventEmails: boolean
  promotionEmails: boolean
}
