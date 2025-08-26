import { useState, useRef, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { useTheme } from "../../context/ThemeContext"
import logoImage from "../../assets/logo.png"
import { Search, Home, Menu, Sun, Moon, User, Settings, LogOut } from "lucide-react"
import AuthenticationModals from "../authentication/AuthenticationModals"
import { logoutUser } from "../../utils/authUtils"

export default function Navbar({ onMenuClick, onSearch, searchQuery, isAuthenticated, setIsAuthenticated }) {
  const { isDark, toggleTheme } = useTheme()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || "")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState("signin")
  const location = useLocation()

  const userMenuRef = useRef(null)

  // Check if current page is home
  const isHome = location.pathname === '/'

  // Update local search query when prop changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery || "")
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [showUserMenu])

  const handleSignInClick = () => {
    setAuthMode("signin")
    setShowAuthModal(true)
  }

  const handleSignUpClick = () => {
    setAuthMode("signup")
    setShowAuthModal(true)
  }

  const handleLogout = async () => {
    try {
      const result = await logoutUser()
      if (result.success) {
        setIsAuthenticated(false)
        // Optional: Show success toast
        console.log(result.message)
      } else {
        console.error('Logout failed:', result.message)
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setLocalSearchQuery(value)
    if (onSearch) {
      onSearch(value)
    }
  }

  const clearSearch = () => {
    setLocalSearchQuery("")
    if (onSearch) {
      onSearch("")
    }
  }

  return (
    <>
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-md px-6 py-4 sticky top-0 z-30">
        <div className="flex items-center justify-between space-x-5">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center space-x-3 mr-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                <img src={logoImage} alt="logo" />
              </div>
              <span className="font-bold text-2xl hidden sm:block bg-gradient-to-bl from-purple-600 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                StreamFlow
              </span>
            </Link>
          </div>

          {/* Center - Home Icon and Search Bar */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1 justify-center max-w-2xl">
            <Link
              to="/"
              className={`hidden lg:block p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${isHome
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}
            >
              <Home className="w-5 h-5" />
            </Link>

            <div className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black dark:text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search songs, artists ..."
                value={localSearchQuery}
                onChange={handleSearchInputChange}
                className="w-full pl-12 pr-12 py-3 bg-gray-100/80 dark:bg-gray-700/80 rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-purple-100 dark:focus:bg-purple-900/20 backdrop-blur-sm transition-all duration-300"
              />
              {localSearchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-110"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Authentication buttons or User menu */}
            {!isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSignUpClick}
                  className="hidden sm:block px-4 py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-xl transition-all duration-300 font-medium"
                >
                  Sign Up
                </button>
                <button
                  onClick={handleSignInClick}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg"
                >
                  <User className="w-5 h-5 text-white" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-3 z-50">
                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-xl mx-2 w-11/12 text-left"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </button>

                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-xl mx-2 w-11/12 text-left"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </button>

                    <hr className="my-2 border-gray-200/50 dark:border-gray-700/50 mx-4" />

                    <button
                      onClick={() => {
                        handleLogout()
                        setShowUserMenu(false)
                      }}
                      className="flex items-center px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors rounded-xl mx-2 w-11/12 text-left"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Authentication Modal */}
      <AuthenticationModals
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onAuthSuccess={() => setIsAuthenticated(true)}
        setIsAuthenticated={setIsAuthenticated}
      />
    </>
  )
}