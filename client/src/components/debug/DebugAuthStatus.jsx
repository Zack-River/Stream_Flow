// components/debug/DebugAuthStatus.jsx
import { useAuth } from '../../context/AuthContext'
import { hasAuthCookies } from '../../utils/authUtils'

export default function DebugAuthStatus() {
  const { isAuthenticated, user, isLoading, error } = useAuth()
  const cookiesPresent = hasAuthCookies()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white text-xs p-4 rounded-lg max-w-sm z-50">
      <h3 className="font-bold mb-2">🐛 Auth Debug Info (HTTP-Only Mode)</h3>
      <div className="space-y-1">
        <div>Loading: {isLoading ? '⏳ Yes' : '✅ No'}</div>
        <div>Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
        <div>User: {user ? `✅ ${user.username || user.name}` : '❌ None'}</div>
        <div>HTTP Cookies: {cookiesPresent ? '✅ Present' : '❌ Missing'}</div>
        <div>Error: {error ? `❌ ${error}` : '✅ None'}</div>
        
        <details className="mt-2">
          <summary className="cursor-pointer">👤 User Data</summary>
          <pre className="mt-1 text-xs overflow-auto max-h-32">
            {JSON.stringify(user, null, 2)}
          </pre>
        </details>
        
        <details className="mt-2">
          <summary className="cursor-pointer">🍪 All Cookies</summary>
          <pre className="mt-1 text-xs overflow-auto max-h-32 break-all">
            {document.cookie || 'No cookies'}
          </pre>
        </details>

        <details className="mt-2">
          <summary className="cursor-pointer">🔍 Cookie Analysis</summary>
          <div className="mt-1 text-xs space-y-1">
            {document.cookie.split('; ').filter(Boolean).map((cookie, index) => {
              const [name, value] = cookie.split('=')
              return (
                <div key={index} className="border-l-2 border-gray-600 pl-2">
                  <div className="text-yellow-300">{name}</div>
                  <div className="text-gray-300 truncate max-w-48">
                    {value ? (value.length > 20 ? `${value.slice(0, 20)}...` : value) : 'empty'}
                  </div>
                </div>
              )
            })}
            {!document.cookie && <div className="text-gray-400">No cookies found</div>}
          </div>
        </details>
      </div>
    </div>
  )
}