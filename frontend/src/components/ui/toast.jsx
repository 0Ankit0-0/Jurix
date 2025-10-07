import { toast as hotToast } from 'react-hot-toast'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

const toastStyles = {
  success: {
    icon: CheckCircle,
    className: 'bg-success text-white border-success/20'
  },
  error: {
    icon: XCircle,
    className: 'bg-destructive text-white border-destructive/20'
  },
  warning: {
    icon: AlertCircle,
    className: 'bg-warning text-white border-warning/20'
  },
  info: {
    icon: Info,
    className: 'bg-info text-white border-info/20'
  }
}

const CustomToast = ({ type, message, onDismiss }) => {
  const { icon: Icon, className } = toastStyles[type] || toastStyles.info

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg shadow-lg border ${className} min-w-[300px] max-w-[500px]`}>
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export const toast = {
  success: (message, options = {}) => {
    return hotToast.custom(
      (t) => (
        <CustomToast
          type="success"
          message={message}
          onDismiss={() => hotToast.dismiss(t.id)}
        />
      ),
      {
        duration: 4000,
        position: 'top-right',
        ...options
      }
    )
  },

  error: (message, options = {}) => {
    return hotToast.custom(
      (t) => (
        <CustomToast
          type="error"
          message={message}
          onDismiss={() => hotToast.dismiss(t.id)}
        />
      ),
      {
        duration: 6000,
        position: 'top-right',
        ...options
      }
    )
  },

  warning: (message, options = {}) => {
    return hotToast.custom(
      (t) => (
        <CustomToast
          type="warning"
          message={message}
          onDismiss={() => hotToast.dismiss(t.id)}
        />
      ),
      {
        duration: 5000,
        position: 'top-right',
        ...options
      }
    )
  },

  info: (message, options = {}) => {
    return hotToast.custom(
      (t) => (
        <CustomToast
          type="info"
          message={message}
          onDismiss={() => hotToast.dismiss(t.id)}
        />
      ),
      {
        duration: 4000,
        position: 'top-right',
        ...options
      }
    )
  },

  promise: (promise, messages, options = {}) => {
    return hotToast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Error occurred'
      },
      {
        position: 'top-right',
        ...options
      }
    )
  },

  dismiss: (toastId) => hotToast.dismiss(toastId),
  remove: (toastId) => hotToast.remove(toastId)
}