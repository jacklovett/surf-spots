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

export const getSurfboards = async (userId: string): Promise<Surfboard[]> => {
  return get<Surfboard[]>(`${surfboardsEndpoint}?userId=${userId}`)
}

export const getSurfboard = async (
  surfboardId: string,
  userId: string,
): Promise<Surfboard> => {
  return get<Surfboard>(`${surfboardsEndpoint}/${surfboardId}?userId=${userId}`)
}

export const createSurfboard = async (
  userId: string,
  request: CreateSurfboardRequest,
): Promise<Surfboard> => {
  return post<CreateSurfboardRequest, Surfboard>(
    `${surfboardsEndpoint}?userId=${userId}`,
    request,
  )
}

export const updateSurfboard = async (
  surfboardId: string,
  userId: string,
  request: UpdateSurfboardRequest,
  options?: RequestInit,
): Promise<Surfboard> => {
  return edit<UpdateSurfboardRequest, Surfboard>(
    `${surfboardsEndpoint}/${surfboardId}?userId=${userId}`,
    request,
    options,
  )
}

export const deleteSurfboard = async (
  surfboardId: string,
  userId: string,
  options?: RequestInit,
): Promise<void> => deleteData(
    `${surfboardsEndpoint}/${surfboardId}?userId=${userId}`,
    options,
  )

export const addSurfboardMedia = async (
  surfboardId: string,
  userId: string,
  request: CreateSurfboardMediaRequest,
  options?: RequestInit,
): Promise<SurfboardMedia> => post<CreateSurfboardMediaRequest, SurfboardMedia>(
    `${surfboardsEndpoint}/${surfboardId}/media?userId=${userId}`,
    request,
    options,
  )

export const getSurfboardMediaUploadUrl = async (
  surfboardId: string,
  userId: string,
  request: UploadSurfboardMediaRequest,
  options?: RequestInit,
): Promise<UploadUrlResponse> => post<UploadSurfboardMediaRequest, UploadUrlResponse>(
    `${surfboardsEndpoint}/${surfboardId}/media/upload-url?userId=${userId}`,
    request,
    options,
  )

export const deleteSurfboardMedia = async (
  mediaId: string,
  userId: string,
  options?: RequestInit,
): Promise<void> =>  deleteData(
    `${surfboardsEndpoint}/media/${mediaId}?userId=${userId}`,
    options,
  )
