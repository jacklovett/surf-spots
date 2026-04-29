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
  return get<Surfboard[]>(`${surfboardsEndpoint}`)
}

export const getSurfboard = async (
  surfboardId: string,
): Promise<Surfboard> => {
  return get<Surfboard>(`${surfboardsEndpoint}/${surfboardId}`)
}

export const createSurfboard = async (
  request: CreateSurfboardRequest,
): Promise<Surfboard> => {
  return post<CreateSurfboardRequest, Surfboard>(`${surfboardsEndpoint}`, request)
}

export const updateSurfboard = async (
  surfboardId: string,
  request: UpdateSurfboardRequest,
  options?: RequestInit,
): Promise<Surfboard> => {
  return edit<UpdateSurfboardRequest, Surfboard>(
    `${surfboardsEndpoint}/${surfboardId}`,
    request,
    options,
  )
}

export const deleteSurfboard = async (
  surfboardId: string,
  options?: RequestInit,
): Promise<void> => deleteData(
    `${surfboardsEndpoint}/${surfboardId}`,
    options,
  )

export const addSurfboardMedia = async (
  surfboardId: string,
  request: CreateSurfboardMediaRequest,
  options?: RequestInit,
): Promise<SurfboardMedia> => post<CreateSurfboardMediaRequest, SurfboardMedia>(
    `${surfboardsEndpoint}/${surfboardId}/media`,
    request,
    options,
  )

export const getSurfboardMediaUploadUrl = async (
  surfboardId: string,
  request: UploadSurfboardMediaRequest,
  options?: RequestInit,
): Promise<UploadUrlResponse> => post<UploadSurfboardMediaRequest, UploadUrlResponse>(
    `${surfboardsEndpoint}/${surfboardId}/media/upload-url`,
    request,
    options,
  )

export const deleteSurfboardMedia = async (
  mediaId: string,
  options?: RequestInit,
): Promise<void> =>  deleteData(
    `${surfboardsEndpoint}/media/${mediaId}`,
    options,
  )
