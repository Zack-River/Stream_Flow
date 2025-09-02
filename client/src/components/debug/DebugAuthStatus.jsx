// components/debug/DebugAuthStatus.jsx
import { useAuth } from '../../context/AuthContext'
import { getAccessToken } from '../../utils/authUtils'

export default function DebugAuthStatus() {
  const { isAuthenticated, user, accessToken, isLoading, error } = useAuth()
  const memoryToken = getAccessToken()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white text-xs p-4 rounded-lg max-w-sm z-50">
      <h3 className="font-bold mb-2">🐛 Auth Debug Info</h3>
      <div className="space-y-1">
        <div>Loading: {isLoading ? '⏳ Yes' : '✅ No'}</div>
        <div>Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
        <div>User: {user ? `✅ ${user.username || user.name}` : '❌ None'}</div>
        <div>Context Token: {accessToken ? '✅ Present' : '❌ Missing'}</div>
        <div>Memory Token: {memoryToken ? '✅ Present' : '❌ Missing'}</div>
        <div>Error: {error ? `❌ ${error}` : '✅ None'}</div>
        
        <details className="mt-2">
          <summary className="cursor-pointer">👤 User Data</summary>
          <pre className="mt-1 text-xs overflow-auto max-h-32">
            {JSON.stringify(user, null, 2)}
          </pre>
        </details>
        
        <details className="mt-2">
          <summary className="cursor-pointer">🍪 Cookies</summary>
          <pre className="mt-1 text-xs overflow-auto max-h-32">
            {document.cookie || 'No cookies'}
          </pre>
        </details>
      </div>
    </div>
  )
}