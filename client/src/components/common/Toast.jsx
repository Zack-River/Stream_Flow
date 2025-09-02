import { useState, useEffect } from "react"
import { X, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"

export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

const Toast = ({ 
  message, 
  type = TOAST_TYPES.INFO, 
  duration = 5000, 
  onClose,
  isVisible = true 
}) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShow(true)
      
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose()
        }, duration)
        
        return () => clearTimeout(timer)
      }
    }
  }, [isVisible, duration])

  const handleClose = () => {
    setShow(false)
    setTimeout(() => {
      if (onClose) onClose()
    }, 300)
  }

  // Toast styles based on type
  const getToastStyles = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
      case TOAST_TYPES.ERROR:
        return 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
      case TOAST_TYPES.WARNING:
        return 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
    }
  }

  // Toast icons based on type
  const getToastIcon = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return <CheckCircle className="w-5 h-5" />
      case TOAST_TYPES.ERROR:
        return <XCircle className="w-5 h-5" />
      case TOAST_TYPES.WARNING:
        return <AlertTriangle className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed top-[88px] right-4 z-[70] max-w-sm transform transition-all duration-300 ${
        show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${getToastStyles()} rounded-lg shadow-lg p-4`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getToastIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium break-words">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity ml-2"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Toast Container Component
export const ToastContainer = ({ toasts = [], onRemoveToast }) => {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          isVisible={toast.isVisible}
          onClose={() => onRemoveToast(toast.id)}
        />
      ))}
    </>
  )
}

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([])

  const showToast = (message, type = TOAST_TYPES.INFO, duration = 5000) => {
    const id = Date.now() + Math.random()
    const newToast = {
      id,
      message,
      type,
      duration,
      isVisible: true
    }

    setToasts(prev => [...prev, newToast])
    return id
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const clearAllToasts = () => {
    setToasts([])
  }

  // Convenience methods
  const showSuccessToast = (message, duration) => showToast(message, TOAST_TYPES.SUCCESS, duration)
  const showErrorToast = (message, duration) => showToast(message, TOAST_TYPES.ERROR, duration)
  const showWarningToast = (message, duration) => showToast(message, TOAST_TYPES.WARNING, duration)
  const showInfoToast = (message, duration) => showToast(message, TOAST_TYPES.INFO, duration)

  // Authentication specific toasts
  const showAuthToast = (message, isSuccess = true, duration = 4000) => {
    return isSuccess ? showSuccessToast(message, duration) : showErrorToast(message, duration)
  }

  const showWelcomeToast = (username) => {
    const message = username ? `Welcome back, ${username}!` : 'Welcome back!'
    return showSuccessToast(message, 4000)
  }

  const showRegistrationToast = (username) => {
    const message = username ? `Welcome to StreamFlow, ${username}!` : 'Welcome to StreamFlow!'
    return showSuccessToast(message, 4000)
  }

  const showGoodbyeToast = () => {
    return showInfoToast('You have been logged out. See you next time!', 3000)
  }

  return {
    toasts,
    showToast,
    removeToast,
    clearAllToasts,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    showAuthToast,
    showWelcomeToast,
    showRegistrationToast,
    showGoodbyeToast
  }
}

export default Toast