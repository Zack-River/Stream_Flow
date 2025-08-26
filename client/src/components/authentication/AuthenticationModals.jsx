import { useState, useEffect } from "react"
import { Formik, Field } from "formik"
import FormInput from "../FormInput/FormInput"
import * as Yup from "yup"
import { X, Mail, Lock, User } from "lucide-react"

// Validation schemas
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

export default function AuthenticationModals({ isOpen, onClose, initialMode = "signin" }) {
  const [mode, setMode] = useState(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Persistent form values using useState
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

  // Handle modal opening/closing animations
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [isOpen, initialMode])

  // Handle form submissions
  const handleSignInSubmit = (values, { setSubmitting }) => {
    console.log("Sign in validated:", values)
    // API call will go here
    setSubmitting(false)
    // Clear form on successful submission
    clearAllForms()
    // You can call onClose() here after successful authentication
  }

  const handleSignUpSubmit = (values, { setSubmitting }) => {
    console.log("Sign up validated:", values)
    // API call will go here
    setSubmitting(false)
    // Clear form on successful submission
    clearAllForms()
    // You can call onClose() here after successful authentication
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      setMode("signin")
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

  // Clear all forms (useful for logout or reset)
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
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={handleBackgroundClick}
    >
      <div
        className={`bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 w-full max-w-md transform transition-all duration-300 ${isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"
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
          <div className="p-6">
            <Formik
              initialValues={signInValues}
              validationSchema={signInSchema}
              onSubmit={handleSignInSubmit}
              enableReinitialize
            >
              {({ values, isSubmitting, handleSubmit }) => {
                // Update state when form values change
                useEffect(() => {
                  setSignInValues(values)
                }, [values])

                return (
                  <div className="space-y-5">
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
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting ? "Signing In..." : "Sign In"}
                    </button>

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
                  </div>
                )
              }}
            </Formik>
          </div>
        )}

        {/* Sign Up Form */}
        {mode === "signup" && (
          <div className="p-6">
            <Formik
              initialValues={signUpValues}
              validationSchema={signUpSchema}
              onSubmit={handleSignUpSubmit}
              enableReinitialize
            >
              {({ values, isSubmitting, handleSubmit }) => {
                // Update state when form values change
                useEffect(() => {
                  setSignUpValues(values)
                }, [values])

                return (
                  <div className="space-y-4">
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
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting ? "Creating Account..." : "Create Account"}
                    </button>

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