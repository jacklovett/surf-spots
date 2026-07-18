let activeScrollAnimation = 0

const getScrollY = (): number =>
  Math.max(window.scrollY, document.documentElement.scrollTop, document.body.scrollTop)

const setScrollY = (y: number): void => {
  window.scrollTo(0, y)
  document.documentElement.scrollTop = y
  document.body.scrollTop = y
}

export const scrollPageToTop = () => {
  if (typeof window === 'undefined') {
    return
  }

  cancelAnimationFrame(activeScrollAnimation)

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
  const startY = getScrollY()

  if (startY <= 0 || prefersReducedMotion) {
    setScrollY(0)
    return
  }

  const duration = Math.min(450, Math.max(220, startY * 0.35))
  const startTime = performance.now()

  const step = (now: number) => {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const ease = 1 - Math.pow(1 - progress, 3)
    setScrollY(Math.round(startY * (1 - ease)))
    if (progress < 1) {
      activeScrollAnimation = requestAnimationFrame(step)
    }
  }

  activeScrollAnimation = requestAnimationFrame(step)
}
