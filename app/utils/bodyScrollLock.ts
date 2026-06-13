let lockCount = 0
let savedOverflow = ''
let savedPaddingRight = ''

export const lockBodyScroll = (): void => {
  if (lockCount === 0) {
    savedOverflow = document.body.style.overflow
    savedPaddingRight = document.body.style.paddingRight
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`
  }
  lockCount += 1
}

export const unlockBodyScroll = (): void => {
  if (lockCount <= 0) {
    return
  }

  lockCount -= 1

  if (lockCount === 0) {
    document.body.style.overflow = savedOverflow
    document.body.style.paddingRight = savedPaddingRight
  }
}
