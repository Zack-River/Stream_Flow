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
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.name === 'confirmPassword' ? 'Confirm Password' :
                    field.name.charAt(0).toUpperCase() + field.name.slice(1)}
            </label>
            <div className="relative">
                <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    {...field}
                    {...props}
                    type={showPasswordToggle ? (showPassword ? "text" : "password") : type}
                    placeholder={placeholder}
                    className={`w-full pl-10 ${showPasswordToggle ? 'pr-12' : 'pr-4'} py-3 border-gray-400 dark:border-gray-700/80 bg-gray-100/80 dark:bg-gray-700/80 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-gray-600 ${hasError
                            ? "border-red-500"
                            : "border-transparent focus:border-purple-500"
                        }`}
                />
                {showPasswordToggle && (
                    <button
                        type="button"
                        onClick={onPasswordToggle}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                )}
            </div>
            {hasError && (
                <p className="text-red-500 text-sm mt-1">{form.errors[field.name]}</p>
            )}
        </div>
    )
}
