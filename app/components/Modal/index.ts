import { ReactNode } from 'react'
import { Modal } from './Modal'
import { InfoModal } from './InfoModal'

export interface IModalState {
  content: ReactNode
  isVisible: boolean
}

export const initialModalState: IModalState = {
  content: null,
  isVisible: false,
}

export type InfoModalState = {
  isOpen: boolean
  title?: string
  message: string
}

export { ConfirmDestructiveModal } from './ConfirmDestructiveModal'
export { InfoModal }

export default Modal
