import { post, deleteData, get } from './networkService'
import type {
  CreateSurfSessionMediaRequest,
  SurfSessionListItem,
  SurfSessionMedia,
} from '~/types/surfSpots'

const surfSessionsEndpoint = 'surf-sessions'

export interface UploadSurfSessionMediaRequest {
  mediaType: string
}

export interface UploadUrlResponse {
  uploadUrl: string
  mediaId: string
}

export const getSurfSessionById = async (
  sessionId: string,
  options?: RequestInit,
): Promise<SurfSessionListItem | undefined> => {
  const response = await get<SurfSessionListItem>(
    `${surfSessionsEndpoint}/${encodeURIComponent(sessionId)}`,
    options,
  )
  return response?.data
}

export const deleteSurfSession = async (
  sessionId: string,
  options?: RequestInit,
): Promise<void> => {
  await deleteData(`${surfSessionsEndpoint}/${encodeURIComponent(sessionId)}`, options)
}

export const addSurfSessionMedia = async (
  sessionId: string,
  request: CreateSurfSessionMediaRequest,
  options?: RequestInit,
): Promise<SurfSessionMedia> => {
  const response = await post<CreateSurfSessionMediaRequest, SurfSessionMedia>(
    `${surfSessionsEndpoint}/${encodeURIComponent(sessionId)}/media`,
    request,
    options,
  )
  return response?.data as SurfSessionMedia
}

export const getSurfSessionMediaUploadUrl = async (
  sessionId: string,
  request: UploadSurfSessionMediaRequest,
  options?: RequestInit,
): Promise<UploadUrlResponse> => {
  const response = await post<UploadSurfSessionMediaRequest, UploadUrlResponse>(
    `${surfSessionsEndpoint}/${encodeURIComponent(sessionId)}/media/upload-url`,
    request,
    options,
  )
  return response?.data as UploadUrlResponse
}

export const deleteSurfSessionMedia = async (
  mediaId: string,
  options?: RequestInit,
): Promise<void> => {
  await deleteData(`${surfSessionsEndpoint}/media/${mediaId}`, options)
}
