import Toast from '../Toast'
import { useToastContext } from '~/contexts'

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastContext()

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

