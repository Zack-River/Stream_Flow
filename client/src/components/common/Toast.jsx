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
  duration = 3000, 
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

  const getToastIcon = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
      case TOAST_TYPES.ERROR:
        return <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
      case TOAST_TYPES.WARNING:
        return <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
      default:
        return <Info className="w-4 h-4 sm:w-5 sm:h-5" />
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={`w-full max-w-xs sm:max-w-sm transform transition-all duration-300 ${
        show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${getToastStyles()} rounded-lg shadow-lg p-2 sm:p-3`}
    >
      <div className="flex items-start space-x-2 sm:space-x-3">
        <div className="flex-shrink-0">
          {getToastIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium break-words leading-snug">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity ml-1 sm:ml-2"
          aria-label="Close"
        >
          <X className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  )
}

// Enhanced Toast Container with mobile positioning
export const ToastContainer = ({ toasts = [], onRemoveToast }) => {
  return (
    <div className="fixed right-2 sm:right-4 top-16 sm:top-20 z-[70] flex flex-col items-end space-y-1 sm:space-y-2 max-w-[calc(100vw-1rem)] sm:max-w-none">
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
    </div>
  )
}

// Rest of useToast hook remains unchanged
export const useToast = (maxToasts = 4) => {
  const [toasts, setToasts] = useState([])

  const truncateMessage = (text, maxLength = 120) => {
    if (!text || typeof text !== 'string') return text
    const trimmed = text.trim()
    return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength - 1)}…` : trimmed
  }

  const showToast = (message, type = TOAST_TYPES.INFO, duration = 5000) => {
    const id = Date.now() + Math.random()
    const newToast = {
      id,
      message: truncateMessage(message),
      type,
      duration,
      isVisible: true,
      timestamp: Date.now()
    }

    setToasts(prev => {
      let updatedToasts = [...prev, newToast]
      
      if (updatedToasts.length > maxToasts) {
        const toastsToRemove = updatedToasts.length - maxToasts
        updatedToasts = updatedToasts.slice(toastsToRemove)
      }
      
      return updatedToasts
    })
    
    return id
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const clearAllToasts = () => {
    setToasts([])
  }

  const hasSimilarToast = (message, type) => {
    const now = Date.now()
    return toasts.some(toast => 
      toast.message === message && 
      toast.type === type && 
      (now - toast.timestamp) < 2000
    )
  }

  const showUniqueToast = (message, type = TOAST_TYPES.INFO, duration = 5000) => {
    if (!hasSimilarToast(message, type)) {
      return showToast(message, type, duration)
    }
    return null
  }

  const showSuccessToast = (message, duration) => showUniqueToast(message, TOAST_TYPES.SUCCESS, duration)
  const showErrorToast = (message, duration) => showUniqueToast(message, TOAST_TYPES.ERROR, duration)
  const showWarningToast = (message, duration) => showUniqueToast(message, TOAST_TYPES.WARNING, duration)
  const showInfoToast = (message, duration) => showUniqueToast(message, TOAST_TYPES.INFO, duration)

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
    showUniqueToast,
    removeToast,
    clearAllToasts,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    showAuthToast,
    showWelcomeToast,
    showRegistrationToast,
    showGoodbyeToast,
    hasSimilarToast
  }
}

export default Toast