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
  images?: SurfboardImage[]
  createdAt: string
  updatedAt: string
}

export interface SurfboardImage {
  id: string
  surfboardId: string
  originalUrl: string
  thumbUrl?: string
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

export interface CreateSurfboardImageRequest {
  originalUrl: string
  thumbUrl?: string
}
