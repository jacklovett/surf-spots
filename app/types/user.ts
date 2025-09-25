export const usersEndpoint = 'api/users'

export type AuthProvider = 'EMAIL' | 'FACEBOOK' | 'GOOGLE'

export interface AuthRequest {
  email: string
  password?: string
  provider: AuthProvider
  name?: string
  providerId?: string
}

export interface User {
  id: string
  name: string
  email: string
  country?: string
  city?: string
  settings?: UserSettings
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
