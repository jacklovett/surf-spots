import { MouseEvent, ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { lockBodyScroll, unlockBodyScroll } from '~/utils/bodyScrollLock'
import Button from '../Button'

interface IProps {
  children: ReactNode
  onClose: () => void
  containerClassName?: string
  /**
   * When true, the header close control is disabled (e.g. pass `busy` from
   * `useDestructiveConfirmBusy` while a destructive `useFetcher` submit is in flight
   * so users cannot dismiss and tap again).
   */
  disableClose?: boolean
}

export const Modal = (props: IProps) => {
  const { children, onClose, containerClassName, disableClose = false } = props
  const modalContainerClass = ['modal-container', containerClassName]
    .filter(Boolean)
    .join(' ')

  useEffect(() => {
    lockBodyScroll()
    return () => unlockBodyScroll()
  }, [])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !disableClose) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose, disableClose])

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!disableClose && event.target === event.currentTarget) {
      onClose()
    }
  }

  // Use a portal to enforce rendering the modal in the body
  return createPortal(
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={modalContainerClass}>
        <div className="modal-header flex-end">
          <Button
            label="×"
            onClick={disableClose ? undefined : onClose}
            variant="icon"
            disabled={disableClose}
            ariaLabel="Close"
          />
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
