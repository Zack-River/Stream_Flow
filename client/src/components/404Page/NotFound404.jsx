export default function NotFound404() {
  return (
    <div className="flex items-center justify-center py-8 px-4 min-h-[60vh]">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-bold text-purple-500 mb-2 sm:mb-4">404</h1>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-1 sm:mb-2">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg px-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
      </div>
    </div>
  )
}