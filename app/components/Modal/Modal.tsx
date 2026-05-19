import { ReactNode } from 'react'
import { createPortal } from 'react-dom'
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
  // Use a portal to enforce rendering the modal in the body
  return createPortal(
    <div className="modal-overlay">
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
