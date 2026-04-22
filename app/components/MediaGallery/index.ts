import { MediaGallery } from "./MediaGallery"

export interface MediaItem {
  id: string
  url: string
  thumbUrl?: string
  mediaType?: "image" | "video"
  alt?: string
}

export default MediaGallery
