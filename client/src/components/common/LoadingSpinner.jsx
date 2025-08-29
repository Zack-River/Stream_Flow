

export default function LoadingSpinner({ size = "md", message = "Loading..." }) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-3 border-gray-300 border-t-purple-600`}></div>
      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{message}</p>
    </div>
  )
}