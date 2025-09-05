import { useState, useEffect } from "react"
import { Formik, Field } from "formik"
import { useAuth } from "../../context/AuthContext"
import FormInput from "../common/FormInput"
import * as Yup from "yup"
import { X, Mail, Lock, User } from "lucide-react"

// Validation schemas (unchanged)
const signInSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password must not exceed 20 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/,
      "Password must contain at least one uppercase letter, and one special character")
    .required("Password is required")
})

const signUpSchema = Yup.object({
  username: Yup.string()
    .min(2, "Username must be at least 2 characters")
    .max(20, "Username must not exceed 20 characters")
    .required("Username is required"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password must not exceed 20 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/,
      "Password must contain at least one uppercase letter, and one special character")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password")
})

export default function AuthenticationModals({ isOpen, onClose, initialMode, onAuthSuccess, showAuthToast }) {
  const { login, register, isLoading } = useAuth()
  const [mode, setMode] = useState(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Persistent form values using useState (unchanged)
  const [signInValues, setSignInValues] = useState({
    email: "",
    password: ""
  })

  const [signUpValues, setSignUpValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  // Handle modal opening/closing animations (unchanged)
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [isOpen, initialMode])

  // Handle form submissions (unchanged)
  const handleSignInSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      console.log("Sign in attempt:", values.email)
      
      const result = await login({
        email: values.email,
        password: values.password
      }, rememberMe)
      
      if (result.success) {
        if (result.alreadyLoggedIn) {
          if (showAuthToast) {
            showAuthToast('You are already logged in!', true)
          }
        } else {
          if (onAuthSuccess) {
            onAuthSuccess(result.user, false)
          }
        }
        
        clearAllForms()
        handleClose()
      }
    } catch (error) {
      console.error('Sign in error:', error)
      
      if (error.message.includes('email') || error.message.includes('password')) {
        if (error.message.toLowerCase().includes('email')) {
          setFieldError('email', error.message)
        } else {
          setFieldError('password', error.message)
        }
      }
      
      if (showAuthToast) {
        showAuthToast(error.message, false)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignUpSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      console.log("Sign up attempt:", values.username, values.email)
      
      const userData = {
        username: values.username,
        email: values.email,
        password: values.password
      }
      
      const result = await register(userData, null)
      
      if (result.success) {
        if (onAuthSuccess) {
          onAuthSuccess(result.user, true)
        }
        
        clearAllForms()
        handleClose()
      }
    } catch (error) {
      console.error('Sign up error:', error)
      
      if (error.message.toLowerCase().includes('username')) {
        setFieldError('username', 'Username already exists')
      } else if (error.message.toLowerCase().includes('email')) {
        setFieldError('email', 'Email already exists')
      }
      
      if (showAuthToast) {
        showAuthToast(error.message, false)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setShowPassword(false)
    setShowConfirmPassword(false)
    setRememberMe(false)
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      setMode("signin")
      setShowPassword(false)
      setShowConfirmPassword(false)
      setRememberMe(false)
      onClose()
    }, 300)
  }

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const clearAllForms = () => {
    setSignInValues({
      email: "",
      password: ""
    })
    setSignUpValues({
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    })
    setRememberMe(false)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-2 sm:p-4"
      onClick={handleBackgroundClick}
    >
      <div
        className={`bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 w-full max-w-sm mx-2 sm:max-w-md sm:mx-0 transform transition-all duration-300 ${
          isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-bl from-purple-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            {mode === "signin" ? "Welcome Back" : "Join StreamFlow"}
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            disabled={isLoading}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Sign In Form */}
        {mode === "signin" && (
          <div className="p-4 sm:p-6">
            <Formik
              initialValues={signInValues}
              validationSchema={signInSchema}
              onSubmit={handleSignInSubmit}
              enableReinitialize
            >
              {({ values, isSubmitting, handleSubmit }) => {
                useEffect(() => {
                  setSignInValues(values)
                }, [values])

                return (
                  <div className="space-y-4 sm:space-y-5">
                    <Field name="email">
                      {({ field, form }) => (
                        <FormInput
                          field={field}
                          form={form}
                          type="email"
                          placeholder="Enter your email"
                          icon={Mail}
                        />
                      )}
                    </Field>

                    <Field name="password">
                      {({ field, form }) => (
                        <FormInput
                          field={field}
                          form={form}
                          placeholder="Enter your password"
                          icon={Lock}
                          showPasswordToggle
                          showPassword={showPassword}
                          onPasswordToggle={() => setShowPassword(!showPassword)}
                        />
                      )}
                    </Field>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting || isLoading}
                      className="w-full bg-gradient-to-bl from-purple-600 via-purple-600 to-blue-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-purple-700 hover:via-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg mt-4 sm:mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                    >
                      {isSubmitting || isLoading ? "Signing In..." : "Sign In"}
                    </button>

                    <p className="text-center text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-3 sm:mt-4">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("signup")}
                        disabled={isSubmitting || isLoading}
                        className="text-purple-600 hover:text-purple-700 font-semibold transition-colors disabled:opacity-50"
                      >
                        Sign up here
                      </button>
                    </p>
                  </div>
                )
              }}
            </Formik>
          </div>
        )}

        {/* Sign Up Form */}
        {mode === "signup" && (
          <div className="p-4 sm:p-6">
            <Formik
              initialValues={signUpValues}
              validationSchema={signUpSchema}
              onSubmit={handleSignUpSubmit}
              enableReinitialize
            >
              {({ values, isSubmitting, handleSubmit }) => {
                useEffect(() => {
                  setSignUpValues(values)
                }, [values])

                return (
                  <div className="space-y-3 sm:space-y-4">
                    <Field name="username">
                      {({ field, form }) => (
                        <FormInput
                          field={field}
                          form={form}
                          type="text"
                          placeholder="Choose a username"
                          icon={User}
                        />
                      )}
                    </Field>

                    <Field name="email">
                      {({ field, form }) => (
                        <FormInput
                          field={field}
                          form={form}
                          type="email"
                          placeholder="Enter your email"
                          icon={Mail}
                        />
                      )}
                    </Field>

                    <Field name="password">
                      {({ field, form }) => (
                        <FormInput
                          field={field}
                          form={form}
                          placeholder="Create a password"
                          icon={Lock}
                          showPasswordToggle
                          showPassword={showPassword}
                          onPasswordToggle={() => setShowPassword(!showPassword)}
                        />
                      )}
                    </Field>

                    <Field name="confirmPassword">
                      {({ field, form }) => (
                        <FormInput
                          field={field}
                          form={form}
                          placeholder="Confirm your password"
                          icon={Lock}
                          showPasswordToggle
                          showPassword={showConfirmPassword}
                          onPasswordToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                      )}
                    </Field>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting || isLoading}
                      className="w-full bg-gradient-to-bl from-purple-600 via-purple-600 to-blue-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-purple-700 hover:via-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg mt-4 sm:mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                    >
                      {isSubmitting || isLoading ? "Creating Account..." : "Create Account"}
                    </button>

                    <p className="text-center text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-3 sm:mt-4">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("signin")}
                        disabled={isSubmitting || isLoading}
                        className="text-purple-600 hover:text-purple-700 font-semibold transition-colors disabled:opacity-50"
                      >
                        Sign in here
                      </button>
                    </p>
                  </div>
                )
              }}
            </Formik>
          </div>
        )}
      </div>
    </div>
  )
}