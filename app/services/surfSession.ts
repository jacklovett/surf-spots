import { post, deleteData } from './networkService'
import type { CreateSurfSessionMediaRequest, SurfSessionMedia } from '~/types/surfSpots'

const surfSessionsEndpoint = 'surf-sessions'

export interface UploadSurfSessionMediaRequest {
  mediaType: string
}

export interface UploadUrlResponse {
  uploadUrl: string
  mediaId: string
}

export const addSurfSessionMedia = async (
  sessionId: string,
  userId: string,
  request: CreateSurfSessionMediaRequest,
  options?: RequestInit,
): Promise<SurfSessionMedia> =>
  post<CreateSurfSessionMediaRequest, SurfSessionMedia>(
    `${surfSessionsEndpoint}/${sessionId}/media?userId=${userId}`,
    request,
    options,
  )

export const getSurfSessionMediaUploadUrl = async (
  sessionId: string,
  userId: string,
  request: UploadSurfSessionMediaRequest,
  options?: RequestInit,
): Promise<UploadUrlResponse> =>
  post<UploadSurfSessionMediaRequest, UploadUrlResponse>(
    `${surfSessionsEndpoint}/${sessionId}/media/upload-url?userId=${userId}`,
    request,
    options,
  )

export const deleteSurfSessionMedia = async (
  mediaId: string,
  userId: string,
  options?: RequestInit,
): Promise<void> =>
  deleteData(`${surfSessionsEndpoint}/media/${mediaId}?userId=${userId}`, options)
