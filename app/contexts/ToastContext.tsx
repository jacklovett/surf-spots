import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
} from 'react'
import { IToast, ToastType } from '~/components/Toast'

interface ToastContextType {
  toasts: IToast[]
  showToast: (
    message: string,
    type?: ToastType,
    duration?: number,
  ) => void
  showSuccess: (message: string, duration?: number) => void
  showError: (message: string, duration?: number) => void
  showInfo: (message: string, duration?: number) => void
  showWarning: (message: string, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<IToast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration?: number) => {
      // Check if a toast with the same message and type already exists
      setToasts((prev) => {
        const existingToast = prev.find(
          (toast) => toast.message === message && toast.type === type
        )
        if (existingToast) {
          // Toast already exists, don't add duplicate
          return prev
        }
        
        const id = `toast-${Date.now()}-${Math.random()}`
        const newToast: IToast = {
          id,
          message,
          type,
          duration,
        }
        return [...prev, newToast]
      })
    },
    [],
  )

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'success', duration)
    },
    [showToast],
  )

  const showError = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'error', duration)
    },
    [showToast],
  )

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'info', duration)
    },
    [showToast],
  )

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'warning', duration)
    },
    [showToast],
  )

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        removeToast,
      }}
    >
      {children}
    </ToastContext.Provider>
  )
}

export const useToastContext = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider')
  }
  return context
}

