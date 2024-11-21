import { ReactNode } from 'react'
import { Modal } from './Modal'

export interface IModalState {
  content: ReactNode
  isVisible: boolean
}

export default Modal
