import { post, deleteData, get, isNetworkError } from './networkService'
import type {
  CreateSurfSessionMediaRequest,
  EndLiveSurfSessionRequest,
  StartLiveSurfSessionRequest,
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

export const startLiveSurfSession = async (
  request: StartLiveSurfSessionRequest,
  options?: RequestInit,
): Promise<SurfSessionListItem> => {
  const response = await post<StartLiveSurfSessionRequest, SurfSessionListItem>(
    `${surfSessionsEndpoint}/start`,
    request,
    options,
  )
  return response?.data as SurfSessionListItem
}

export const getInProgressSurfSession = async (
  options?: RequestInit,
): Promise<SurfSessionListItem | null> => {
  try {
    const response = await get<SurfSessionListItem>(
      `${surfSessionsEndpoint}/in-progress`,
      options,
    )
    return response?.data ?? null
  } catch (error) {
    if (isNetworkError(error) && error.status === 404) {
      return null
    }
    throw error
  }
}

export const endLiveSurfSession = async (
  sessionId: string,
  request: EndLiveSurfSessionRequest,
  options?: RequestInit,
): Promise<SurfSessionListItem> => {
  const response = await post<EndLiveSurfSessionRequest, SurfSessionListItem>(
    `${surfSessionsEndpoint}/${encodeURIComponent(sessionId)}/end`,
    request,
    options,
  )
  return response?.data as SurfSessionListItem
}

export interface LinkSessionsToSpotRequest {
  surfSpotId: number
  anchorLatitude: number
  anchorLongitude: number
  sessionId?: number
}

export interface LinkSessionsToSpotResult {
  linkedSessionCount: number
  message?: string
}

export const linkSessionsToSpot = async (
  request: LinkSessionsToSpotRequest,
  options?: RequestInit,
): Promise<LinkSessionsToSpotResult> => {
  const response = await post<
    LinkSessionsToSpotRequest,
    Pick<LinkSessionsToSpotResult, 'linkedSessionCount'>
  >(`${surfSessionsEndpoint}/link-to-spot`, request, options)

  const payload = response?.data
  return {
    linkedSessionCount: payload?.linkedSessionCount ?? 0,
    message: response?.message,
  }
}
