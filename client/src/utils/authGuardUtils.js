// client/src/utils/authGuardUtils.js
import { showErrorToast, showWarningToast } from './toastUtils'

/**
 * Authentication guard function that checks if user is authenticated
 * before executing an action
 */
export const withAuthGuard = (isAuthenticated, action, options = {}) => {
  const {
    onAuthRequired = null,
    authMode = 'signin',
    errorMessage = 'You must be authenticated to perform this action.',
    showToast = true,
    toastDuration = 4000
  } = options

  return (...args) => {
    if (!isAuthenticated) {
      // Show toast notification if enabled
      if (showToast) {
        showErrorToast(errorMessage, toastDuration)
      }
      
      // Call auth required callback if provided
      if (onAuthRequired && typeof onAuthRequired === 'function') {
        onAuthRequired(authMode)
      }
      
      // Return early, preventing the action
      return false
    }
    
    // User is authenticated, execute the action
    try {
      return action(...args)
    } catch (error) {
      console.error('Error executing authenticated action:', error)
      if (showToast) {
        showErrorToast('An error occurred. Please try again.', toastDuration)
      }
      return false
    }
  }
}

/**
 * Create an authentication guard hook
 */
export const useAuthGuard = (isAuthenticated, onAuthRequired = null) => {
  const createGuardedAction = (action, options = {}) => {
    return withAuthGuard(isAuthenticated, action, {
      onAuthRequired,
      ...options
    })
  }

  const guardPlayAction = (playSongFunction, options = {}) => {
    return createGuardedAction(playSongFunction, {
      errorMessage: 'You must be authenticated to play songs.',
      ...options
    })
  }

  const guardFavoriteAction = (favoriteFunction, options = {}) => {
    return createGuardedAction(favoriteFunction, {
      errorMessage: 'You must be authenticated to add favorites.',
      ...options
    })
  }

  const guardPlaylistAction = (playlistFunction, options = {}) => {
    return createGuardedAction(playlistFunction, {
      errorMessage: 'You must be authenticated to manage playlists.',
      ...options
    })
  }

  const guardUploadAction = (uploadFunction, options = {}) => {
    return createGuardedAction(uploadFunction, {
      errorMessage: 'You must be authenticated to upload songs.',
      ...options
    })
  }

  return {
    createGuardedAction,
    guardPlayAction,
    guardFavoriteAction,
    guardPlaylistAction,
    guardUploadAction,
    isAuthenticated
  }
}

/**
 * Specific auth guard functions for common actions
 */
export const createPlayGuard = (isAuthenticated, playSongFunction, onAuthRequired = null) => {
  return withAuthGuard(isAuthenticated, playSongFunction, {
    onAuthRequired,
    errorMessage: 'You must be authenticated to play songs.',
    authMode: 'signin'
  })
}

export const createFavoriteGuard = (isAuthenticated, favoriteFunction, onAuthRequired = null) => {
  return withAuthGuard(isAuthenticated, favoriteFunction, {
    onAuthRequired,
    errorMessage: 'You must be authenticated to add favorites.',
    authMode: 'signin'
  })
}

export const createPlaylistGuard = (isAuthenticated, playlistFunction, onAuthRequired = null) => {
  return withAuthGuard(isAuthenticated, playlistFunction, {
    onAuthRequired,
    errorMessage: 'You must be authenticated to manage playlists.',
    authMode: 'signin'
  })
}

/**
 * Higher-order component for wrapping components with auth guards
 * Note: This should be used in .jsx files, not .js files
 */
export const createAuthRequiredWrapper = (options = {}) => {
  const {
    fallbackComponent = null,
    showToast = true,
    errorMessage = 'Authentication required to access this feature.'
  } = options

  return function withAuthenticationRequired(WrappedComponent) {
    return function AuthenticatedComponent(props) {
      const { isAuthenticated, onAuthRequired, ...restProps } = props

      if (!isAuthenticated) {
        if (showToast) {
          showWarningToast(errorMessage, 4000)
        }
        
        if (onAuthRequired) {
          onAuthRequired('signin')
        }
        
        if (fallbackComponent) {
          return fallbackComponent
        }
        
        return null
      }

      return WrappedComponent(restProps)
    }
  }
}

/**
 * Utility to check multiple permission levels
 */
export const checkPermissions = (user, requiredPermissions = []) => {
  if (!user) return false
  
  // If no specific permissions required, just check if authenticated
  if (requiredPermissions.length === 0) return true
  
  // Check if user has all required permissions
  // This would depend on your user permission system
  const userPermissions = user.permissions || []
  
  return requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  )
}

/**
 * Create a permission guard
 */
export const createPermissionGuard = (user, requiredPermissions, action, options = {}) => {
  const {
    onPermissionDenied = null,
    errorMessage = 'You do not have permission to perform this action.',
    showToast = true
  } = options

  return (...args) => {
    if (!checkPermissions(user, requiredPermissions)) {
      if (showToast) {
        showErrorToast(errorMessage, 4000)
      }
      
      if (onPermissionDenied) {
        onPermissionDenied()
      }
      
      return false
    }
    
    return action(...args)
  }
}

/**
 * Simple authentication check utility
 */
export const requireAuth = (isAuthenticated, onAuthRequired, message = 'You must be signed in to continue.') => {
  if (!isAuthenticated) {
    showErrorToast(message, 4000)
    if (onAuthRequired) {
      onAuthRequired('signin')
    }
    return false
  }
  return true
}

/**
 * Batch authentication guard for multiple actions
 */
export const createBatchAuthGuard = (isAuthenticated, onAuthRequired) => {
  return {
    play: (action) => createPlayGuard(isAuthenticated, action, onAuthRequired),
    favorite: (action) => createFavoriteGuard(isAuthenticated, action, onAuthRequired),
    playlist: (action) => createPlaylistGuard(isAuthenticated, action, onAuthRequired),
    custom: (action, options = {}) => withAuthGuard(isAuthenticated, action, {
      onAuthRequired,
      ...options
    })
  }
}