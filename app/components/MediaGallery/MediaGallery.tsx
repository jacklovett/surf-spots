import { useState } from 'react'
import Modal from '../Modal'
import TextButton from '../TextButton'

export interface MediaItem {
  id: string
  url: string
  thumbUrl?: string
  mediaType?: 'image' | 'video'
  alt?: string
}

export interface MediaGalleryProps {
  items: MediaItem[]
  canDelete?: boolean
  onDelete?: (item: MediaItem) => Promise<void> | void
  altText?: string
}

export const MediaGallery = ({
  items,
  canDelete = false,
  onDelete,
  altText = 'Media',
}: MediaGalleryProps) => {
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null)

  if (!items || items.length === 0) {
    return null
  }

  const handleDelete = async () => {
    if (previewItem && onDelete) {
      await onDelete(previewItem)
      setPreviewItem(null)
    }
  }

  const isVideo = (item: MediaItem) => {
    return item.mediaType === 'video' || item.url.match(/\.(mp4|webm|ogg)$/i)
  }

  return (
    <>
      <div className="image-gallery">
        {items.map((item) => (
          <div
            key={item.id}
            className="image-thumbnail"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setPreviewItem(item)
            }}
          >
            {isVideo(item) ? (
              <video src={item.thumbUrl || item.url} muted />
            ) : (
              <img src={item.thumbUrl || item.url} alt={item.alt || altText} />
            )}
          </div>
        ))}
      </div>

      {previewItem && (
        <Modal onClose={() => setPreviewItem(null)}>
          <div className="image-preview-modal">
            {isVideo(previewItem) ? (
              <video
                src={previewItem.url}
                controls
                className="image-preview-full"
              />
            ) : (
              <img
                src={previewItem.url}
                alt={previewItem.alt || altText}
                className="image-preview-full"
              />
            )}
            {canDelete && onDelete && (
              <div className="image-preview-actions">
                <TextButton
                  text="Delete"
                  iconKey="bin"
                  onClick={handleDelete}
                  filled
                  danger
                />
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
