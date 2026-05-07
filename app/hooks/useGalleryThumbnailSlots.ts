import { useCallback, useEffect, useRef, useState } from 'react'

const MIN_CELL_DESKTOP = 120
const MIN_CELL_MOBILE = 100

const parseGapPx = (containerElement: HTMLElement): number => {
  const raw =
    getComputedStyle(containerElement).gap ||
    getComputedStyle(containerElement).columnGap
  const gapPixels = parseFloat(raw)
  return Number.isFinite(gapPixels) ? gapPixels : 8
}

const getMinCellPx = (): number => {
  if (typeof window === 'undefined') {
    return MIN_CELL_DESKTOP
  }
  return window.matchMedia('(max-width: 768px)').matches
    ? MIN_CELL_MOBILE
    : MIN_CELL_DESKTOP
}

type GalleryThumbnailLayout = {
  minCell: number
  slots: number
}

/**
 * Measures the gallery container and estimates how many thumbnail columns fit in one row
 * (same min track sizes as MediaGallery.scss). Used to cap thumbnails to a single row with a +N tile.
 */
export const useGalleryThumbnailSlots = (itemCount: number) => {
  const ref = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<GalleryThumbnailLayout>(() => ({
    minCell: MIN_CELL_DESKTOP,
    slots: Math.max(1, itemCount),
  }))

  const measure = useCallback(() => {
    const gridContainer = ref.current
    if (!gridContainer) {
      return
    }
    const widthPx = gridContainer.getBoundingClientRect().width
    if (widthPx <= 0) {
      return
    }
    const gapPx = parseGapPx(gridContainer)
    const minCell = getMinCellPx()
    const slots = Math.max(
      1,
      Math.floor((widthPx + gapPx) / (minCell + gapPx)),
    )
    setLayout({ slots, minCell })
  }, [])

  useEffect(() => {
    const gridContainer = ref.current
    if (!gridContainer) {
      return
    }

    measure()
    const resizeObserver = new ResizeObserver(() => measure())
    resizeObserver.observe(gridContainer)
    const narrowViewportMediaQuery = window.matchMedia(
      '(max-width: 768px)',
    )
    const onViewportChange = () => measure()
    narrowViewportMediaQuery.addEventListener('change', onViewportChange)
    window.addEventListener('resize', onViewportChange)

    return () => {
      resizeObserver.disconnect()
      narrowViewportMediaQuery.removeEventListener('change', onViewportChange)
      window.removeEventListener('resize', onViewportChange)
    }
  }, [measure, itemCount])

  return { ref, slotsPerRow: layout.slots, minCellPx: layout.minCell }
}
