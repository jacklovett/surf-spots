export interface Surfboard {
  id: string
  userId: string
  name: string
  boardType?: string
  length?: number
  width?: number
  thickness?: number
  volume?: number
  finSetup?: string
  description?: string
  modelUrl?: string
  media?: SurfboardMedia[]
  createdAt: string
  updatedAt: string
}

export interface SurfboardMedia {
  id: string
  surfboardId: string
  originalUrl: string
  thumbUrl?: string
  mediaType?: string
  createdAt: string
}

export interface CreateSurfboardRequest {
  name: string
  boardType?: string
  length?: number
  width?: number
  thickness?: number
  volume?: number
  finSetup?: string
  description?: string
  modelUrl?: string
}

export interface UpdateSurfboardRequest {
  name?: string
  boardType?: string
  length?: number
  width?: number
  thickness?: number
  volume?: number
  finSetup?: string
  description?: string
  modelUrl?: string
}

export interface CreateSurfboardMediaRequest {
  originalUrl: string
  thumbUrl?: string
  mediaType?: string
}
