import { Eye, EyeOff } from "lucide-react"

export default function FormInput({
    field,
    form,
    type = "text",
    placeholder,
    icon: Icon,
    showPasswordToggle,
    showPassword,
    onPasswordToggle,
    ...props
}) {
    const hasError = form.errors[field.name] && form.touched[field.name]
    return (
        <div className="space-y-1 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.name === 'confirmPassword' ? 'Confirm Password' :
                    field.name.charAt(0).toUpperCase() + field.name.slice(1)}
            </label>
            <div className="relative">
                <Icon className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                    {...field}
                    {...props}
                    type={showPasswordToggle ? (showPassword ? "text" : "password") : type}
                    placeholder={placeholder}
                    className={`w-full pl-8 sm:pl-10 ${showPasswordToggle ? 'pr-10 sm:pr-12' : 'pr-3 sm:pr-4'} py-2.5 sm:py-3 border-gray-500/25 dark:border-gray-600 bg-gray-100/80 dark:bg-gray-700/80 rounded-lg sm:rounded-xl border-2 transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-gray-600 text-sm sm:text-base ${hasError
                        ? "focus:border-red-500 dark:focus:border-red-500 " 
                        : "border-transparent focus:border-purple-500 dark:focus:border-purple-500"
                        }`}
                />
                
                {showPasswordToggle && (
                    <button
                        type="button"
                        onClick={onPasswordToggle}
                        className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                )}
            </div>
            {hasError && (
                <p className="text-red-500 text-xs sm:text-sm mt-0.5 sm:mt-1">{form.errors[field.name]}</p>
            )}
        </div>
    )
}