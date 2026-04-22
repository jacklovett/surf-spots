import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import classNames from 'classnames'
import Button from '../Button'
import SkeletonLoader from '../SkeletonLoader'
import { MediaItem } from './index'

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
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [thumbnailLoadedState, setThumbnailLoadedState] = useState<
    Record<string, boolean>
  >({})
  const [previewMediaLoaded, setPreviewMediaLoaded] = useState(false)
  const previewItem = previewIndex !== null ? items[previewIndex] : null

  if (!items || items.length === 0) {
    return null
  }

  const closePreview = () => setPreviewIndex(null)

  const showPrevious = () => {
    if (previewIndex === null) return
    setPreviewIndex((previewIndex - 1 + items.length) % items.length)
  }

  const showNext = () => {
    if (previewIndex === null) return
    setPreviewIndex((previewIndex + 1) % items.length)
  }

  const handleDelete = async () => {
    if (previewItem && onDelete) {
      await onDelete(previewItem)
      closePreview()
    }
  }

  const isVideo = (item: MediaItem) => {
    return item.mediaType === 'video' || item.url.match(/\.(mp4|webm|ogg)$/i)
  }

  useEffect(() => {
    if (previewIndex === null) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        showPrevious()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        showNext()
      } else if (event.key === 'Escape') {
        event.preventDefault()
        closePreview()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [previewIndex, items.length])

  useEffect(() => {
    if (previewItem) {
      setPreviewMediaLoaded(false)
    }
  }, [previewItem?.id])

  useEffect(() => {
    if (previewIndex === null) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [previewIndex])

  return (
    <>
      <div className="image-gallery">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="image-thumbnail"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setPreviewIndex(index)
            }}
          >
            {!thumbnailLoadedState[item.id] && <SkeletonLoader />}
            {isVideo(item) ? (
              <video
                src={item.thumbUrl || item.url}
                muted
                className={classNames({
                  'image-media-loading': !thumbnailLoadedState[item.id],
                })}
                onLoadedData={() =>
                  setThumbnailLoadedState((prevState) => ({
                    ...prevState,
                    [item.id]: true,
                  }))
                }
              />
            ) : (
              <img
                src={item.thumbUrl || item.url}
                alt={item.alt || altText}
                className={classNames({
                  'image-media-loading': !thumbnailLoadedState[item.id],
                })}
                onLoad={() =>
                  setThumbnailLoadedState((prevState) => ({
                    ...prevState,
                    [item.id]: true,
                  }))
                }
              />
            )}
          </div>
        ))}
      </div>

      {previewItem &&
        createPortal(
          <div className="media-lightbox-overlay" onClick={closePreview}>
            <Button
              label="×"
              variant="icon"
              className="media-lightbox-control media-lightbox-close"
              onClick={closePreview}
              ariaLabel="Close media viewer"
            />
            <div
              className="media-lightbox-content"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="media-lightbox-stage">
                {items.length > 1 && (
                  <Button
                    variant="icon"
                    className="media-lightbox-control image-preview-nav image-preview-nav-prev"
                    onClick={showPrevious}
                    ariaLabel="Show previous media"
                    icon={{ name: 'chevron-left' }}
                  />
                )}

                {!previewMediaLoaded && <SkeletonLoader />}
                {isVideo(previewItem) ? (
                  <video
                    src={previewItem.url}
                    controls
                    autoPlay={false}
                    muted={false}
                    playsInline
                    preload="metadata"
                    className={classNames('image-preview-full', {
                      'image-media-loading': !previewMediaLoaded,
                    })}
                    onLoadedData={() => setPreviewMediaLoaded(true)}
                  />
                ) : (
                  <img
                    src={previewItem.url}
                    alt={previewItem.alt || altText}
                    className={classNames('image-preview-full', {
                      'image-media-loading': !previewMediaLoaded,
                    })}
                    onLoad={() => setPreviewMediaLoaded(true)}
                  />
                )}

                {items.length > 1 && (
                  <Button
                    variant="icon"
                    className="media-lightbox-control image-preview-nav image-preview-nav-next"
                    onClick={showNext}
                    ariaLabel="Show next media"
                    icon={{ name: 'chevron-right' }}
                  />
                )}
              </div>

              <div className="image-preview-footer">
                {items.length > 1 && previewIndex !== null && (
                  <div className="image-preview-counter">
                    {previewIndex + 1} / {items.length}
                  </div>
                )}
                {canDelete && onDelete && (
                  <div className="image-preview-actions">
                    <Button
                      label="Delete"
                      icon={{ name: 'bin' }}
                      variant="danger"
                      size="small"
                      onClick={handleDelete}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
