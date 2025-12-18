export interface Trip {
  id: string
  ownerId: string
  ownerName: string
  title: string
  description?: string
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
  spots?: TripSpot[]
  members?: TripMember[]
  media?: TripMedia[]
  surfboards?: TripSurfboard[]
  isOwner?: boolean
}

export interface NewTripSpot {
  surfSpotId: number
  surfSpotName: string
  surfSpotRating?: number
  addedAt: string
}

export interface TripSpot extends NewTripSpot {
  id: string
}

export interface TripMember {
  id: string
  userId?: string // null for pending invitations
  userName?: string // null for pending invitations
  userEmail: string
  addedAt?: string // null for pending invitations
  status: string // "ACCEPTED" for members, "PENDING" for invitations
  invitedAt?: string // for pending invitations
}

export interface TripMedia {
  id: string
  url: string
  mediaType: string
  ownerId: string
  ownerName: string
  uploadedAt: string
}

export interface TripSurfboard {
  id: string
  surfboardId: string
  surfboardName: string
  addedAt: string
}

export interface CreateTripRequest {
  title: string
  description?: string
  startDate?: string
  endDate?: string
}

export interface UpdateTripRequest {
  title?: string
  description?: string
  startDate?: string
  endDate?: string
}

export interface AddTripMemberRequest {
  userId?: string
  email?: string
}

export interface UploadMediaRequest {
  mediaType: string
}

export interface RecordMediaRequest {
  mediaId: string
  url: string
  mediaType: string
}

export interface UploadUrlResponse {
  uploadUrl: string
  mediaId: string
}
