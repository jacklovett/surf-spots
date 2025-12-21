export const usersEndpoint = 'api/users'

export type AuthProvider = 'EMAIL' | 'FACEBOOK' | 'GOOGLE'

export interface AuthRequest {
  email: string
  password?: string
  provider: AuthProvider
  name?: string
  providerId?: string
}

import { SkillLevel } from './surfSpots'

export interface User {
  id: string
  name: string
  email: string
  country?: string
  city?: string
  age?: number
  gender?: string
  height?: number
  weight?: number
  skillLevel?: SkillLevel
  settings?: UserSettings
}

export interface ProfileState {
  country: string
  email: string
  name: string
  city: string
  age: string
  gender: string
  height: string
  weight: string
  skillLevel: string
}

export interface UserSettings {
  newSurfSpotEmails: boolean
  nearbySurfSpotsEmails: boolean
  swellSeasonEmails: boolean
  eventEmails: boolean
  promotionEmails: boolean
}
