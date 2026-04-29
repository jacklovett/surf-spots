import { createPortal } from 'react-dom'
import classNames from 'classnames'
import Button from '../Button'
import SkeletonLoader from '../SkeletonLoader'
import { MediaItem } from './index'
import { isVideoMediaItem, useMediaGallery } from '~/hooks'

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
  const gallery = useMediaGallery(items)

  const handleDeleteFromPreview = async () => {
    if (!gallery.previewItem || !onDelete) return
    await onDelete(gallery.previewItem)
    gallery.closePreview()
  }

  if (gallery.isEmpty) {
    return null
  }

  const {
    list,
    thumbnailLoadedState,
    markThumbnailLoaded,
    previewIndex,
    previewItem,
    previewMediaLoaded,
    markFullPreviewLoaded,
    closePreview,
    showPrevious,
    showNext,
    openPreviewAt,
  } = gallery

  return (
    <>
      <div className="image-gallery">
        {list.map((item, index) => (
          <div
            key={item.id}
            className="image-thumbnail"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              openPreviewAt(index)
            }}
          >
            {!thumbnailLoadedState[item.id] && <SkeletonLoader />}
            {isVideoMediaItem(item) ? (
              <video
                src={item.thumbUrl || item.url}
                muted
                className={classNames({
                  'image-media-loading': !thumbnailLoadedState[item.id],
                })}
                onLoadedData={() => markThumbnailLoaded(item.id)}
              />
            ) : (
              <img
                src={item.thumbUrl || item.url}
                alt={item.alt || altText}
                className={classNames({
                  'image-media-loading': !thumbnailLoadedState[item.id],
                })}
                onLoad={() => markThumbnailLoaded(item.id)}
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
                {list.length > 1 && (
                  <Button
                    variant="icon"
                    className="media-lightbox-control image-preview-nav image-preview-nav-prev"
                    onClick={showPrevious}
                    ariaLabel="Show previous media"
                    icon={{ name: 'chevron-left' }}
                  />
                )}

                {!previewMediaLoaded && <SkeletonLoader />}
                {isVideoMediaItem(previewItem) ? (
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
                    onLoadedData={markFullPreviewLoaded}
                  />
                ) : (
                  <img
                    src={previewItem.url}
                    alt={previewItem.alt || altText}
                    className={classNames('image-preview-full', {
                      'image-media-loading': !previewMediaLoaded,
                    })}
                    onLoad={markFullPreviewLoaded}
                  />
                )}

                {list.length > 1 && (
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
                {list.length > 1 && previewIndex !== null && (
                  <div className="image-preview-counter">
                    {previewIndex + 1} / {list.length}
                  </div>
                )}
                {canDelete && onDelete && (
                  <div className="image-preview-actions">
                    <Button
                      label="Delete"
                      icon={{ name: 'bin' }}
                      variant="danger"
                      size="small"
                      onClick={handleDeleteFromPreview}
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
