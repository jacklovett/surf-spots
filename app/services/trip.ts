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

export const getTrips = async (userId: string): Promise<Trip[]> => {
  return get<Trip[]>(`${tripsEndpoint}/mine?userId=${userId}`)
}

export const getTrip = async (
  tripId: string,
  userId: string,
): Promise<Trip> => {
  return get<Trip>(`${tripsEndpoint}/${tripId}?userId=${userId}`)
}

export const createTrip = async (
  userId: string,
  request: CreateTripRequest,
): Promise<Trip> => {
  return post<CreateTripRequest, Trip>(
    `${tripsEndpoint}?userId=${userId}`,
    request,
  )
}

export const updateTrip = async (
  tripId: string,
  userId: string,
  request: UpdateTripRequest,
  options?: RequestInit,
): Promise<Trip> => {
  return edit<UpdateTripRequest, Trip>(
    `${tripsEndpoint}/${tripId}?userId=${userId}`,
    request,
    options,
  )
}

export const deleteTrip = async (
  tripId: string,
  userId: string,
): Promise<void> => {
  return deleteData(`${tripsEndpoint}/${tripId}?userId=${userId}`)
}

export const addSpot = async (
  tripId: string,
  userId: string,
  surfSpotId: number,
): Promise<string> => {
  return post<undefined, string>(
    `${tripsEndpoint}/${tripId}/spots/${surfSpotId}?userId=${userId}`,
    undefined,
  )
}

export const removeSpot = async (
  tripId: string,
  tripSpotId: string,
  userId: string,
): Promise<void> => {
  return deleteData(
    `${tripsEndpoint}/${tripId}/spots/${tripSpotId}?userId=${userId}`,
  )
}

export const addMember = async (
  tripId: string,
  userId: string,
  request: AddTripMemberRequest,
  options?: RequestInit,
): Promise<void> => {
  return post<AddTripMemberRequest, void>(
    `${tripsEndpoint}/${tripId}/members?userId=${userId}`,
    request,
    options,
  )
}

export const removeMember = async (
  tripId: string,
  memberUserId: string,
  currentUserId: string,
): Promise<void> => {
  return deleteData(
    `${tripsEndpoint}/${tripId}/members/${memberUserId}?currentUserId=${currentUserId}`,
  )
}

export const cancelInvitation = async (
  tripId: string,
  invitationId: string,
  userId: string,
): Promise<void> => {
  return deleteData(
    `${tripsEndpoint}/${tripId}/invitations/${invitationId}?userId=${userId}`,
  )
}

export const getUploadUrl = async (
  tripId: string,
  userId: string,
  request: UploadMediaRequest,
  options?: RequestInit,
): Promise<UploadUrlResponse> => post<UploadMediaRequest, UploadUrlResponse>(
    `${tripsEndpoint}/${tripId}/media/upload-url?userId=${userId}`,
    request,
    options,
  )

export const recordMedia = async (
  tripId: string,
  userId: string,
  request: RecordMediaRequest,
  options?: RequestInit,
): Promise<void> => {
  return post<RecordMediaRequest, void>(
    `${tripsEndpoint}/${tripId}/media?userId=${userId}`,
    request,
    options,
  )
}

export const deleteMedia = async (
  tripId: string,
  mediaId: string,
  userId: string,
): Promise<void> => {
  return deleteData(
    `${tripsEndpoint}/${tripId}/media/${mediaId}?userId=${userId}`,
  )
}

export const addSurfboard = async (
  tripId: string,
  surfboardId: string,
  userId: string,
): Promise<string> => {
  return post<undefined, string>(
    `${tripsEndpoint}/${tripId}/surfboards/${surfboardId}?userId=${userId}`,
    undefined,
  )
}

export const removeSurfboard = async (
  tripId: string,
  tripSurfboardId: string,
  userId: string,
): Promise<void> => {
  return deleteData(
    `${tripsEndpoint}/${tripId}/surfboards/${tripSurfboardId}?userId=${userId}`,
  )
}
