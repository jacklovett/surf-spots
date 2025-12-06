import { Modal, Button } from '~/components'

export interface InfoModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
}

export const InfoModal = ({
  isOpen,
  onClose,
  title,
  message,
}: InfoModalProps) => {
  if (!isOpen) return null

  return (
    <Modal onClose={onClose}>
      <div className="info-modal-content">
        {title && <h2>{title}</h2>}
        <p>{message}</p>
        <Button label="OK" onClick={onClose} />
      </div>
    </Modal>
  )
}
