import { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Button from '../Button'

interface IProps {
  children: ReactNode
  onClose: () => void
  containerClassName?: string
}

export const Modal = (props: IProps) => {
  const { children, onClose, containerClassName } = props
  const modalContainerClass = ['modal-container', containerClassName]
    .filter(Boolean)
    .join(' ')
  // Use a portal to enforce rendering the modal in the body
  return createPortal(
    <div className="modal-overlay">
      <div className={modalContainerClass}>
        <div className="modal-header flex-end">
          <Button label="×" onClick={onClose} variant="icon" />
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
