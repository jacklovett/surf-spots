import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import classNames from 'classnames'
import Button from '../Button'
import SkeletonLoader from '../SkeletonLoader'
import { MediaItem } from './index'
import {
  isVideoMediaItem,
  useGalleryThumbnailSlots,
  useMediaGallery,
} from '~/hooks'

const syncThumbImageIfReady = (
  imageElement: HTMLImageElement | null,
  onReady: (id: string) => void,
  id: string,
) => {
  if (imageElement?.complete && imageElement.naturalHeight > 0) {
    onReady(id)
  }
}

const syncThumbVideoIfReady = (
  videoElement: HTMLVideoElement | null,
  onReady: (id: string) => void,
  id: string,
) => {
  if (
    videoElement &&
    videoElement.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
  ) {
    onReady(id)
  }
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
  const gallery = useMediaGallery(items)
  const { ref: galleryGridRef, slotsPerRow, minCellPx } =
    useGalleryThumbnailSlots(items.length)

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

  const singleColumnOverflow = slotsPerRow === 1 && list.length > 1
  const multiColumnOverflow = slotsPerRow > 1 && list.length > slotsPerRow
  const showOverflowTile = singleColumnOverflow || multiColumnOverflow

  const visibleThumbCount = showOverflowTile
    ? singleColumnOverflow
      ? 0
      : slotsPerRow - 1
    : list.length

  const moreCount = list.length - visibleThumbCount
  const columnCount = showOverflowTile
    ? singleColumnOverflow
      ? 1
      : slotsPerRow
    : list.length

  const visibleItems = list.slice(0, visibleThumbCount)

  const overflowPeekItem =
    showOverflowTile && list.length > 0
      ? list[singleColumnOverflow ? 0 : visibleThumbCount]
      : null

  const openFromOverflow = () =>
    openPreviewAt(singleColumnOverflow ? 0 : visibleThumbCount)

  useEffect(() => {
    const gridRoot = galleryGridRef.current
    if (!gridRoot) {
      return
    }
    gridRoot.style.setProperty('--gallery-column-count', String(columnCount))
    gridRoot.style.setProperty('--gallery-min-track-px', `${minCellPx}px`)
  }, [columnCount, minCellPx])

  return (
    <>
      <div ref={galleryGridRef} className="image-gallery">
        {visibleItems.map((item, index) => (
          <div
            key={item.id}
            className="image-thumbnail"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              openPreviewAt(index)
            }}
          >
            {!thumbnailLoadedState[item.id] && <SkeletonLoader />}
            {isVideoMediaItem(item) ? (
              <video
                src={item.thumbUrl || item.url}
                muted
                playsInline
                preload="metadata"
                className={classNames({
                  'image-media-loading': !thumbnailLoadedState[item.id],
                })}
                ref={(videoElement) =>
                  syncThumbVideoIfReady(
                    videoElement,
                    markThumbnailLoaded,
                    item.id,
                  )
                }
                onLoadedData={() => markThumbnailLoaded(item.id)}
                onLoadedMetadata={(event) => {
                  const videoElement = event.currentTarget
                  if (
                    videoElement.readyState >=
                    HTMLMediaElement.HAVE_CURRENT_DATA
                  ) {
                    markThumbnailLoaded(item.id)
                  }
                }}
                onError={() => markThumbnailLoaded(item.id)}
              />
            ) : (
              <img
                src={item.thumbUrl || item.url}
                alt={item.alt || altText}
                className={classNames({
                  'image-media-loading': !thumbnailLoadedState[item.id],
                })}
                ref={(imageElement) =>
                  syncThumbImageIfReady(
                    imageElement,
                    markThumbnailLoaded,
                    item.id,
                  )
                }
                onLoad={() => markThumbnailLoaded(item.id)}
                onError={() => markThumbnailLoaded(item.id)}
              />
            )}
          </div>
        ))}
        {showOverflowTile && overflowPeekItem && (
          <div
            className="image-thumbnail image-gallery-overflow"
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              openFromOverflow()
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                event.stopPropagation()
                openFromOverflow()
              }
            }}
            aria-label={`Open gallery, ${moreCount} more items`}
          >
            {!thumbnailLoadedState[overflowPeekItem.id] && <SkeletonLoader />}
            {isVideoMediaItem(overflowPeekItem) ? (
              <video
                src={overflowPeekItem.thumbUrl || overflowPeekItem.url}
                muted
                playsInline
                preload="metadata"
                className={classNames({
                  'image-media-loading':
                    !thumbnailLoadedState[overflowPeekItem.id],
                })}
                ref={(videoElement) =>
                  syncThumbVideoIfReady(
                    videoElement,
                    markThumbnailLoaded,
                    overflowPeekItem.id,
                  )
                }
                onLoadedData={() => markThumbnailLoaded(overflowPeekItem.id)}
                onLoadedMetadata={(event) => {
                  const videoElement = event.currentTarget
                  if (
                    videoElement.readyState >=
                    HTMLMediaElement.HAVE_CURRENT_DATA
                  ) {
                    markThumbnailLoaded(overflowPeekItem.id)
                  }
                }}
                onError={() => markThumbnailLoaded(overflowPeekItem.id)}
              />
            ) : (
              <img
                src={overflowPeekItem.thumbUrl || overflowPeekItem.url}
                alt={overflowPeekItem.alt || altText}
                className={classNames({
                  'image-media-loading':
                    !thumbnailLoadedState[overflowPeekItem.id],
                })}
                ref={(imageElement) =>
                  syncThumbImageIfReady(
                    imageElement,
                    markThumbnailLoaded,
                    overflowPeekItem.id,
                  )
                }
                onLoad={() => markThumbnailLoaded(overflowPeekItem.id)}
                onError={() => markThumbnailLoaded(overflowPeekItem.id)}
              />
            )}
            <div className="image-gallery-overflow-scrim" aria-hidden>
              <span className="image-gallery-overflow-label">+{moreCount}</span>
            </div>
          </div>
        )}
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

                <div className="media-lightbox-media-wrap">
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
                </div>

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
