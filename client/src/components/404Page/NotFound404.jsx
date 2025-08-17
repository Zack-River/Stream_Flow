import { Link } from "react-router-dom"
import { Home, ArrowLeft, Search } from "lucide-react"

export default function NotFound404() {
  return (
    <main 
      className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4"
      role="main"
      aria-labelledby="error-page-title"
    >
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <h1 
            id="error-page-title"
            className="text-9xl font-bold text-purple-500 mb-4"
            aria-label="Error 404"
          >
            404
          </h1>
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Oops! The page you're looking for doesn't exist.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            The page might have been moved, deleted, or you entered the wrong URL.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              aria-label="Go back to home page"
            >
              <Home className="w-5 h-5" aria-hidden="true" />
              <span>Go Home</span>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center space-x-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-medium transition-colors"
              aria-label="Go back to previous page"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
              <span>Go Back</span>
            </button>
          </div>

          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Looking for something specific?
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Try searching for music or browse our library
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center space-x-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200 dark:border-gray-600"
              aria-label="Search for music"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              <span>Search Music</span>
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="mt-12 space-y-2" aria-hidden="true">
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </main>
  )
}