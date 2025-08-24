import { useState, useEffect } from "react"
import { X, Eye, EyeOff, Mail, Lock, User } from "lucide-react"

export default function AuthenticationModals({ isOpen, onClose, initialMode = "signin" }) {
  const [mode, setMode] = useState(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  
  // Form states
  const [signInForm, setSignInForm] = useState({
    email: "",
    password: ""
  })
  
  const [signUpForm, setSignUpForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  
  // Error states
  const [signInErrors, setSignInErrors] = useState({})
  const [signUpErrors, setSignUpErrors] = useState({})

  // Handle modal opening/closing animations
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [isOpen, initialMode])

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateSignIn = () => {
    const errors = {}
    
    if (!signInForm.email) {
      errors.email = "Email is required"
    } else if (!validateEmail(signInForm.email)) {
      errors.email = "Please enter a valid email address"
    }
    
    if (!signInForm.password) {
      errors.password = "Password is required"
    } else if (signInForm.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }
    
    setSignInErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateSignUp = () => {
    const errors = {}
    
    if (!signUpForm.username) {
      errors.username = "Username is required"
    } else if (signUpForm.username.length < 3) {
      errors.username = "Username must be at least 3 characters"
    }
    
    if (!signUpForm.email) {
      errors.email = "Email is required"
    } else if (!validateEmail(signUpForm.email)) {
      errors.email = "Please enter a valid email address"
    }
    
    if (!signUpForm.password) {
      errors.password = "Password is required"
    } else if (signUpForm.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }
    
    if (!signUpForm.confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
    } else if (signUpForm.password !== signUpForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }
    
    setSignUpErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submissions
  const handleSignIn = (e) => {
    e.preventDefault()
    if (validateSignIn()) {
      console.log("Sign in validated:", signInForm)
      // API call will go here
    }
  }

  const handleSignUp = (e) => {
    e.preventDefault()
    if (validateSignUp()) {
      console.log("Sign up validated:", signUpForm)
      // API call will go here
    }
  }

  // Handle input changes
  const handleSignInChange = (field, value) => {
    setSignInForm(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (signInErrors[field]) {
      setSignInErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleSignUpChange = (field, value) => {
    setSignUpForm(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (signUpErrors[field]) {
      setSignUpErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    // Clear forms and errors when switching
    setSignInForm({ email: "", password: "" })
    setSignUpForm({ username: "", email: "", password: "", confirmPassword: "" })
    setSignInErrors({})
    setSignUpErrors({})
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      // Reset everything when modal closes
      setMode("signin")
      setSignInErrors({})
      setSignUpErrors({})
      setShowPassword(false)
      setShowConfirmPassword(false)
      onClose()
    }, 300)
  }

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  // Handle password visibility without losing focus
  const handlePasswordToggle = (type, inputRef) => {
    if (type === 'password') {
      setShowPassword(!showPassword)
    } else {
      setShowConfirmPassword(!showConfirmPassword)
    }
    // Maintain focus on the input
    setTimeout(() => {
      if (inputRef && inputRef.current) {
        inputRef.current.focus()
      }
    }, 0)
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={handleBackgroundClick}
    >
      <div 
        className={`bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 w-full max-w-md transform transition-all duration-300 ${
          isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {mode === "signin" ? "Welcome Back" : "Join StreamFlow"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sign In Form */}
        {mode === "signin" && (
          <form onSubmit={handleSignIn} className="p-6 space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={signInForm.email}
                  onChange={(e) => handleSignInChange("email", e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border-gray-400 dark:border-gray-700/80 bg-gray-100/80 dark:bg-gray-700/80 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-gray-600 ${
                    signInErrors.email 
                      ? "border-red-500" 
                      : "border-transparent focus:border-purple-500"
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {signInErrors.email && (
                <p className="text-red-500 text-sm mt-1">{signInErrors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={(ref) => { if (ref) ref.passwordInputRef = ref }}
                  type={showPassword ? "text" : "password"}
                  value={signInForm.password}
                  onChange={(e) => handleSignInChange("password", e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border-gray-400 dark:border-gray-700/80 bg-gray-100/80 dark:bg-gray-700/80 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-gray-600 ${
                    signInErrors.password 
                      ? "border-red-500" 
                      : "border-transparent focus:border-purple-500"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {signInErrors.password && (
                <p className="text-red-500 text-sm mt-1">{signInErrors.password}</p>
              )}
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg mt-6"
            >
              Sign In
            </button>

            {/* Switch to Sign Up */}
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-4">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
              >
                Sign up here
              </button>
            </p>
          </form>
        )}

        {/* Sign Up Form */}
        {mode === "signup" && (
          <form onSubmit={handleSignUp} className="p-6 space-y-4">
            {/* Username Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={signUpForm.username}
                  onChange={(e) => handleSignUpChange("username", e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border-gray-400 dark:border-gray-700/80 bg-gray-100/80 dark:bg-gray-700/80 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-gray-600 ${
                    signUpErrors.username 
                      ? "border-red-500" 
                      : "border-transparent focus:border-purple-500"
                  }`}
                  placeholder="Choose a username"
                />
              </div>
              {signUpErrors.username && (
                <p className="text-red-500 text-sm mt-1">{signUpErrors.username}</p>
              )}
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={signUpForm.email}
                  onChange={(e) => handleSignUpChange("email", e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border-gray-400 dark:border-gray-700/80 bg-gray-100/80 dark:bg-gray-700/80 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-gray-600 ${
                    signUpErrors.email 
                      ? "border-red-500" 
                      : "border-transparent focus:border-purple-500"
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {signUpErrors.email && (
                <p className="text-red-500 text-sm mt-1">{signUpErrors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={signUpForm.password}
                  onChange={(e) => handleSignUpChange("password", e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border-gray-400 dark:border-gray-700/80 bg-gray-100/80 dark:bg-gray-700/80 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-gray-600 ${
                    signUpErrors.password 
                      ? "border-red-500" 
                      : "border-transparent focus:border-purple-500"
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {signUpErrors.password && (
                <p className="text-red-500 text-sm mt-1">{signUpErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={signUpForm.confirmPassword}
                  onChange={(e) => handleSignUpChange("confirmPassword", e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border-gray-400 dark:border-gray-700/80 bg-gray-100/80 dark:bg-gray-700/80 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-gray-600 ${
                    signUpErrors.confirmPassword 
                      ? "border-red-500" 
                      : "border-transparent focus:border-purple-500"
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {signUpErrors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{signUpErrors.confirmPassword}</p>
              )}
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg mt-6"
            >
              Create Account
            </button>

            {/* Switch to Sign In */}
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-4">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
              >
                Sign in here
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}