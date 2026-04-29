/** Path segment after VITE_API_URL (which already includes `/api`). */
export const usersEndpoint = 'users'

export type AuthProvider = 'EMAIL' | 'FACEBOOK' | 'GOOGLE'

/** OAuth provider id used in routes/callbacks (lowercase). */
export type OAuthProvider = 'google' | 'facebook'

export interface AuthRequest {
  email: string
  password?: string
  provider: AuthProvider
  name?: string
  providerId?: string
}

import { EmergencyContactRelationship, SkillLevel } from './surfSpots'

/**
 * Minimal identity claims we store in the signed session cookie. Anything
 * outside this shape must be fetched from GET /api/user/me so that PII
 * never rides in the cookie. See app/services/auth.server.ts toSessionUser.
 */
export interface SessionUser {
  id: string
  name: string
  email: string
}

/**
 * Full profile returned by GET /api/user/me. Never store this in the session
 * cookie; fetch it in a loader/action where you need more than identity.
 */
export interface User extends SessionUser {
  country?: string
  city?: string
  age?: number
  gender?: string
  height?: number
  weight?: number
  skillLevel?: SkillLevel
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelationship?: EmergencyContactRelationship
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
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
}

export interface UserSettings {
  newSurfSpotEmails: boolean
  nearbySurfSpotsEmails: boolean
  swellSeasonEmails: boolean
  eventEmails: boolean
  promotionEmails: boolean
}
