import { ReactNode } from 'react'
import { Modal } from './Modal'

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

import ConfirmDestructiveModal from '../ConfirmDestructiveModal'
import InfoModal from '../InfoModal'

export { ConfirmDestructiveModal, InfoModal }
export default Modal