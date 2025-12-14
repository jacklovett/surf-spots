import { get, post, edit, deleteData } from './networkService'
import {
  Surfboard,
  CreateSurfboardRequest,
  UpdateSurfboardRequest,
  CreateSurfboardImageRequest,
  SurfboardImage,
} from '~/types/surfboard'

const surfboardsEndpoint = 'surfboards'

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
): Promise<void> => {
  return deleteData(`${surfboardsEndpoint}/${surfboardId}?userId=${userId}`)
}

export const addSurfboardImage = async (
  surfboardId: string,
  userId: string,
  request: CreateSurfboardImageRequest,
  options?: RequestInit,
): Promise<SurfboardImage> => {
  return post<CreateSurfboardImageRequest, SurfboardImage>(
    `${surfboardsEndpoint}/${surfboardId}/images?userId=${userId}`,
    request,
    options,
  )
}

export const deleteSurfboardImage = async (
  imageId: string,
  userId: string,
  options?: RequestInit,
): Promise<void> => {
  return deleteData(
    `${surfboardsEndpoint}/images/${imageId}?userId=${userId}`,
    options,
  )
}



