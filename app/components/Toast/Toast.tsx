import { useEffect } from 'react'
import classNames from 'classnames'
import Icon from '../Icon'
import { IToast } from './index'
import type { IconKey } from '../Icon'

interface ToastProps {
  toast: IToast
  onRemove: (id: string) => void
}

export const Toast = ({ toast, onRemove }: ToastProps) => {
  const duration = toast.duration ?? 5000

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(toast.id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [toast.id, duration, onRemove])

  // Use assertive for errors (urgent), polite for others
  const ariaLive = toast.type === 'error' ? 'assertive' : 'polite'
  const role = toast.type === 'error' ? 'alert' : 'status'

  return (
    <div
      className={classNames('toast', {
        [`toast--${toast.type}`]: true,
      })}
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
    >
      <div className="toast-icon" aria-hidden="true">
        <Icon iconKey={(toast.type === 'warning' ? 'error' : toast.type) as IconKey} useCurrentColor />
      </div>
      <div className="toast-content">
        <span className="toast-message">{toast.message}</span>
      </div>
      <button
        className="toast-close"
        onClick={() => onRemove(toast.id)}
        aria-label={`Close ${toast.type} notification`}
        type="button"
      >
        ×
      </button>
    </div>
  )
}
