import { Toast } from './Toast'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface IToast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

export default Toast

