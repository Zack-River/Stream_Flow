export default function NotFound404() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-purple-500 mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
      </div>
    </div>
  )
}