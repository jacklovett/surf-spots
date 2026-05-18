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
  const response = await get<Trip[]>(
    `${tripsEndpoint}/user/${encodeURIComponent(userId)}`,
    options,
  )
  return response?.data ?? []
}

export const getTrip = async (tripId: string): Promise<Trip> => {
  const response = await get<Trip>(`${tripsEndpoint}/${tripId}`)
  return response?.data as Trip
}

export const createTrip = async (
  request: CreateTripRequest,
): Promise<Trip> => {
  const response = await post<CreateTripRequest, Trip>(`${tripsEndpoint}`, request)
  return response?.data as Trip
}

export const updateTrip = async (
  tripId: string,
  request: UpdateTripRequest,
  options?: RequestInit,
): Promise<Trip> => {
  const response = await edit<UpdateTripRequest, Trip>(
    `${tripsEndpoint}/${tripId}`,
    request,
    options,
  )
  return response?.data as Trip
}

export const deleteTrip = async (tripId: string): Promise<void> => {
  await deleteData(`${tripsEndpoint}/${tripId}`)
}

export const addSpot = async (
  tripId: string,
  surfSpotId: number,
): Promise<string> => {
  const response = await post<undefined, string>(
    `${tripsEndpoint}/${tripId}/spots/${surfSpotId}`,
    undefined,
  )
  return response?.data as string
}

export const removeSpot = async (
  tripId: string,
  tripSpotId: string,
): Promise<void> => {
  await deleteData(`${tripsEndpoint}/${tripId}/spots/${tripSpotId}`)
}

export const addMember = async (
  tripId: string,
  request: AddTripMemberRequest,
  options?: RequestInit,
): Promise<void> => {
  await post<AddTripMemberRequest, void>(
    `${tripsEndpoint}/${tripId}/members`,
    request,
    options,
  )
}

export const removeMember = async (
  tripId: string,
  memberUserId: string,
): Promise<void> => {
  await deleteData(`${tripsEndpoint}/${tripId}/members/${memberUserId}`)
}

export const cancelInvitation = async (
  tripId: string,
  invitationId: string,
): Promise<void> => {
  await deleteData(`${tripsEndpoint}/${tripId}/invitations/${invitationId}`)
}

export const getUploadUrl = async (
  tripId: string,
  request: UploadMediaRequest,
  options?: RequestInit,
): Promise<UploadUrlResponse> => {
  const response = await post<UploadMediaRequest, UploadUrlResponse>(
    `${tripsEndpoint}/${tripId}/media/upload-url`,
    request,
    options,
  )
  return response?.data as UploadUrlResponse
}

export const recordMedia = async (
  tripId: string,
  request: RecordMediaRequest,
  options?: RequestInit,
): Promise<void> => {
  await post<RecordMediaRequest, void>(
    `${tripsEndpoint}/${tripId}/media`,
    request,
    options,
  )
}

export const deleteMedia = async (
  tripId: string,
  mediaId: string,
): Promise<void> => {
  await deleteData(`${tripsEndpoint}/${tripId}/media/${mediaId}`)
}

export const addSurfboard = async (
  tripId: string,
  surfboardId: string,
): Promise<string> => {
  const response = await post<undefined, string>(
    `${tripsEndpoint}/${tripId}/surfboards/${surfboardId}`,
    undefined,
  )
  return response?.data as string
}

export const removeSurfboard = async (
  tripId: string,
  tripSurfboardId: string,
): Promise<void> => {
  await deleteData(`${tripsEndpoint}/${tripId}/surfboards/${tripSurfboardId}`)
}
