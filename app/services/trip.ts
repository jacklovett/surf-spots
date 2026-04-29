import { get, post, edit, deleteData } from './networkService'
import {
  Trip,
  CreateTripRequest,
  UpdateTripRequest,
  AddTripMemberRequest,
  UploadMediaRequest,
  RecordMediaRequest,
  UploadUrlResponse,
} from '~/types/trip'

const tripsEndpoint = 'trips'

export const getTrips = async (
  userId: string,
  options?: RequestInit,
): Promise<Trip[]> => {
  return get<Trip[]>(
    `${tripsEndpoint}/user/${encodeURIComponent(userId)}`,
    options,
  )
}

export const getTrip = async (
  tripId: string,
): Promise<Trip> => {
  return get<Trip>(`${tripsEndpoint}/${tripId}`)
}

export const createTrip = async (
  request: CreateTripRequest,
): Promise<Trip> => {
  return post<CreateTripRequest, Trip>(`${tripsEndpoint}`, request)
}

export const updateTrip = async (
  tripId: string,
  request: UpdateTripRequest,
  options?: RequestInit,
): Promise<Trip> => {
  return edit<UpdateTripRequest, Trip>(
    `${tripsEndpoint}/${tripId}`,
    request,
    options,
  )
}

export const deleteTrip = async (
  tripId: string,
): Promise<void> => {
  return deleteData(`${tripsEndpoint}/${tripId}`)
}

export const addSpot = async (
  tripId: string,
  surfSpotId: number,
): Promise<string> => {
  return post<undefined, string>(
    `${tripsEndpoint}/${tripId}/spots/${surfSpotId}`,
    undefined,
  )
}

export const removeSpot = async (
  tripId: string,
  tripSpotId: string,
): Promise<void> => {
  return deleteData(`${tripsEndpoint}/${tripId}/spots/${tripSpotId}`)
}

export const addMember = async (
  tripId: string,
  request: AddTripMemberRequest,
  options?: RequestInit,
): Promise<void> => {
  return post<AddTripMemberRequest, void>(
    `${tripsEndpoint}/${tripId}/members`,
    request,
    options,
  )
}

export const removeMember = async (
  tripId: string,
  memberUserId: string,
): Promise<void> => {
  return deleteData(`${tripsEndpoint}/${tripId}/members/${memberUserId}`)
}

export const cancelInvitation = async (
  tripId: string,
  invitationId: string,
): Promise<void> => {
  return deleteData(`${tripsEndpoint}/${tripId}/invitations/${invitationId}`)
}

export const getUploadUrl = async (
  tripId: string,
  request: UploadMediaRequest,
  options?: RequestInit,
): Promise<UploadUrlResponse> => post<UploadMediaRequest, UploadUrlResponse>(
    `${tripsEndpoint}/${tripId}/media/upload-url`,
    request,
    options,
  )

export const recordMedia = async (
  tripId: string,
  request: RecordMediaRequest,
  options?: RequestInit,
): Promise<void> => {
  return post<RecordMediaRequest, void>(
    `${tripsEndpoint}/${tripId}/media`,
    request,
    options,
  )
}

export const deleteMedia = async (
  tripId: string,
  mediaId: string,
): Promise<void> => {
  return deleteData(`${tripsEndpoint}/${tripId}/media/${mediaId}`)
}

export const addSurfboard = async (
  tripId: string,
  surfboardId: string,
): Promise<string> => {
  return post<undefined, string>(
    `${tripsEndpoint}/${tripId}/surfboards/${surfboardId}`,
    undefined,
  )
}

export const removeSurfboard = async (
  tripId: string,
  tripSurfboardId: string,
): Promise<void> => {
  return deleteData(`${tripsEndpoint}/${tripId}/surfboards/${tripSurfboardId}`)
}
