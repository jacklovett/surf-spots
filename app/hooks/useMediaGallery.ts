import { useCallback, useEffect, useState } from 'react'
import type { MediaItem } from '~/components/MediaGallery'

export const isVideoMediaItem = (item: MediaItem): boolean =>
  item.mediaType === 'video' || /\.(mp4|webm|ogg)$/i.test(item.url)

/**
 * Gallery grid + lightbox: preview index, keyboard, body scroll lock, and index clamping
 * when the items list changes. Hooks always run (even when the list is empty) so call sites
 * must not early-return before this hook.
 */
export const useMediaGallery = (items: MediaItem[] | undefined) => {
  const list = items ?? []
  const count = list.length

  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [thumbnailLoadedState, setThumbnailLoadedState] = useState<
    Record<string, boolean>
  >({})
  const [previewMediaLoaded, setPreviewMediaLoaded] = useState(false)

  const previewItem =
    previewIndex !== null &&
    previewIndex >= 0 &&
    previewIndex < count
      ? list[previewIndex]
      : null

  useEffect(() => {
    if (count === 0) {
      setPreviewIndex(null)
      return
    }
    setPreviewIndex((i) => {
      if (i === null) return null
      if (i >= count) return count - 1
      return i
    })
  }, [count])

  useEffect(() => {
    if (previewIndex === null || count === 0) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setPreviewIndex((i) =>
          i === null ? null : (i - 1 + count) % count,
        )
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        setPreviewIndex((i) => (i === null ? null : (i + 1) % count))
      } else if (event.key === 'Escape') {
        event.preventDefault()
        setPreviewIndex(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [previewIndex, count])

  useEffect(() => {
    if (previewItem) {
      setPreviewMediaLoaded(false)
    }
  }, [previewItem?.id])

  useEffect(() => {
    if (previewIndex === null) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [previewIndex])

  const closePreview = useCallback(() => {
    setPreviewIndex(null)
  }, [])

  const showPrevious = useCallback(() => {
    if (count === 0) return
    setPreviewIndex((i) =>
      i === null ? null : (i - 1 + count) % count,
    )
  }, [count])

  const showNext = useCallback(() => {
    if (count === 0) return
    setPreviewIndex((i) =>
      i === null ? null : (i + 1) % count,
    )
  }, [count])

  const openPreviewAt = useCallback((index: number) => {
    setPreviewIndex(index)
  }, [])

  const markThumbnailLoaded = useCallback((id: string) => {
    setThumbnailLoadedState((prev) => ({ ...prev, [id]: true }))
  }, [])

  const markFullPreviewLoaded = useCallback(() => {
    setPreviewMediaLoaded(true)
  }, [])

  return {
    list,
    isEmpty: count === 0,
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
  }
}
