import { get, post, edit, deleteData } from './networkService'
import {
  Surfboard,
  CreateSurfboardRequest,
  UpdateSurfboardRequest,
  CreateSurfboardMediaRequest,
  SurfboardMedia,
} from '~/types/surfboard'

const surfboardsEndpoint = 'surfboards'

// Types for upload URL requests
export interface UploadSurfboardMediaRequest {
  mediaType: string
}

export interface UploadUrlResponse {
  uploadUrl: string
  mediaId: string
}

export const getSurfboards = async (): Promise<Surfboard[]> => {
  const response = await get<Surfboard[]>(`${surfboardsEndpoint}`)
  return response?.data ?? []
}

export const getSurfboard = async (
  surfboardId: string,
): Promise<Surfboard> => {
  const response = await get<Surfboard>(`${surfboardsEndpoint}/${surfboardId}`)
  return response?.data as Surfboard
}

export const createSurfboard = async (
  request: CreateSurfboardRequest,
): Promise<Surfboard> => {
  const response = await post<CreateSurfboardRequest, Surfboard>(
    `${surfboardsEndpoint}`,
    request,
  )
  return response?.data as Surfboard
}

export const updateSurfboard = async (
  surfboardId: string,
  request: UpdateSurfboardRequest,
  options?: RequestInit,
): Promise<Surfboard> => {
  const response = await edit<UpdateSurfboardRequest, Surfboard>(
    `${surfboardsEndpoint}/${surfboardId}`,
    request,
    options,
  )
  return response?.data as Surfboard
}

export const deleteSurfboard = async (
  surfboardId: string,
  options?: RequestInit,
): Promise<void> => {
  await deleteData(`${surfboardsEndpoint}/${surfboardId}`, options)
}

export const addSurfboardMedia = async (
  surfboardId: string,
  request: CreateSurfboardMediaRequest,
  options?: RequestInit,
): Promise<SurfboardMedia> => {
  const response = await post<CreateSurfboardMediaRequest, SurfboardMedia>(
    `${surfboardsEndpoint}/${surfboardId}/media`,
    request,
    options,
  )
  return response?.data as SurfboardMedia
}

export const getSurfboardMediaUploadUrl = async (
  surfboardId: string,
  request: UploadSurfboardMediaRequest,
  options?: RequestInit,
): Promise<UploadUrlResponse> => {
  const response = await post<UploadSurfboardMediaRequest, UploadUrlResponse>(
    `${surfboardsEndpoint}/${surfboardId}/media/upload-url`,
    request,
    options,
  )
  return response?.data as UploadUrlResponse
}

export const deleteSurfboardMedia = async (
  mediaId: string,
  options?: RequestInit,
): Promise<void> => {
  await deleteData(`${surfboardsEndpoint}/media/${mediaId}`, options)
}
