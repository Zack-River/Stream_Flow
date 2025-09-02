// client/src/utils/toastUtils.js

/**
 * Toast types
 */
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

/**
 * Create and show a toast notification
 */
export const showToast = (message, type = TOAST_TYPES.INFO, duration = 5000) => {
  // Remove existing toasts of the same type
  const existingToasts = document.querySelectorAll(`.toast-${type}`)
  existingToasts.forEach(toast => toast.remove())

  // Create toast element
  const toast = document.createElement('div')
  toast.className = `toast-${type} fixed top-[88px] right-4 z-[70] max-w-sm transform transition-all duration-300 translate-x-0 opacity-100`
  
  // Toast styles based on type
  const styles = {
    [TOAST_TYPES.SUCCESS]: 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    [TOAST_TYPES.ERROR]: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    [TOAST_TYPES.WARNING]: 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    [TOAST_TYPES.INFO]: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
  }

  // Toast icons based on type
  const icons = {
    [TOAST_TYPES.SUCCESS]: '✅',
    [TOAST_TYPES.ERROR]: '❌',
    [TOAST_TYPES.WARNING]: '⚠️',
    [TOAST_TYPES.INFO]: 'ℹ️'
  }

  toast.className += ` ${styles[type]} rounded-lg shadow-lg p-4`

  // Toast HTML
  toast.innerHTML = `
    <div class="flex items-start space-x-3">
      <div class="text-lg flex-shrink-0">${icons[type]}</div>
      <div class="flex-1">
        <p class="text-sm font-medium break-words">${message}</p>
      </div>
      <button class="toast-close flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity ml-2" aria-label="Close">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `

  // Add close functionality
  const closeButton = toast.querySelector('.toast-close')
  closeButton.addEventListener('click', () => hideToast(toast))

  // Add to document
  document.body.appendChild(toast)

  // Animate in
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)'
    toast.style.opacity = '1'
  })

  // Auto-hide after duration
  if (duration > 0) {
    setTimeout(() => {
      if (document.body.contains(toast)) {
        hideToast(toast)
      }
    }, duration)
  }

  return toast
}

/**
 * Hide a toast with animation
 */
const hideToast = (toast) => {
  toast.style.transform = 'translateX(100%)'
  toast.style.opacity = '0'
  
  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast)
    }
  }, 300)
}

/**
 * Show success toast
 */
export const showSuccessToast = (message, duration) => {
  return showToast(message, TOAST_TYPES.SUCCESS, duration)
}

/**
 * Show error toast
 */
export const showErrorToast = (message, duration) => {
  return showToast(message, TOAST_TYPES.ERROR, duration)
}

/**
 * Show warning toast
 */
export const showWarningToast = (message, duration) => {
  return showToast(message, TOAST_TYPES.WARNING, duration)
}

/**
 * Show info toast
 */
export const showInfoToast = (message, duration) => {
  return showToast(message, TOAST_TYPES.INFO, duration)
}

/**
 * Clear all toasts
 */
export const clearAllToasts = () => {
  const toasts = document.querySelectorAll('[class*="toast-"]')
  toasts.forEach(toast => hideToast(toast))
}

/**
 * Toast for authentication events
 */
export const showAuthToast = (message, isSuccess = true, duration = 4000) => {
  if (isSuccess) {
    return showSuccessToast(message, duration)
  } else {
    return showErrorToast(message, duration)
  }
}

/**
 * Welcome toast for successful login
 */
export const showWelcomeToast = (username) => {
  const message = username ? `Welcome back, ${username}!` : 'Welcome back!'
  return showSuccessToast(message, 4000)
}

/**
 * Goodbye toast for logout
 */
export const showGoodbyeToast = () => {
  return showInfoToast('You have been logged out. See you next time!', 3000)
}