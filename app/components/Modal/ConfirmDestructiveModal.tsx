import type { ReactNode } from 'react'

import Button from '../Button'
import { Modal } from './Modal'

export interface ConfirmDestructiveModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  children: ReactNode
  confirmLabel: string
  cancelLabel?: string
  busy?: boolean
}

export const ConfirmDestructiveModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel,
  cancelLabel = 'Cancel',
  busy = false,
}: ConfirmDestructiveModalProps) => {
  if (!isOpen) {
    return null
  }

  return (
    <Modal onClose={onClose} disableClose={busy}>
      <div className="delete-confirm-modal">
        <h2>{title}</h2>
        {children}
        <div className="modal-actions">
          <Button
            label={confirmLabel}
            variant="danger"
            onClick={onConfirm}
            loading={busy}
            disabled={busy}
          />
          <Button
            label={cancelLabel}
            variant="cancel"
            disabled={busy}
            onClick={onClose}
          />
        </div>
      </div>
    </Modal>
  )
}
