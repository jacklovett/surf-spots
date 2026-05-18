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
  request: CreateSurfSessionMediaRequest,
  options?: RequestInit,
): Promise<SurfSessionMedia> => {
  const response = await post<CreateSurfSessionMediaRequest, SurfSessionMedia>(
    `${surfSessionsEndpoint}/${sessionId}/media`,
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
    `${surfSessionsEndpoint}/${sessionId}/media/upload-url`,
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
