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

export default Modal
