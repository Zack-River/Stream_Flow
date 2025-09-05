// Refactored Navbar.jsx with mobile-first collapsible search
import { useState, useRef, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { useTheme } from "../../context/ThemeContext"
import { useAuth } from "../../context/AuthContext"
import { ToastContainer, useToast } from "../common/Toast"
import { useDebouncedCallback } from "../../hooks/useDebounce"
import { PuffLoader } from 'react-spinners'
import logoImage from "../../assets/logo.png"
import { Search, Home, Menu, Sun, Moon, User, Settings, LogOut, X } from "lucide-react"
import AuthenticationModals from "../authentication/AuthenticationModals"

export default function Navbar({ onMenuClick, onSearch, searchQuery, authLoading }) {
  const { isDark, toggleTheme } = useTheme()
  const { isAuthenticated, user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || "")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState("signin")
  const [isSearching, setIsSearching] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const location = useLocation()

  const userMenuRef = useRef(null)
  const searchInputRef = useRef(null)

  // Enhanced Toast hook with FIFO queue (max 4 toasts)
  const {
    toasts,
    removeToast,
    showGoodbyeToast,
    showWelcomeToast,
    showRegistrationToast,
    showAuthToast
  } = useToast(4)

  // Check if current page is home
  const isHome = location.pathname === '/'

  // Debounced search callback - only triggers after 500ms of no typing
  const [debouncedSearch] = useDebouncedCallback(
    (query) => {
      setIsSearching(false)
      if (onSearch) {
        onSearch(query)
      }
    },
    500,
    [onSearch]
  )

  // Update local search query when prop changes (external updates)
  useEffect(() => {
    setLocalSearchQuery(searchQuery || "")
  }, [searchQuery])

  // Focus search input when mobile search opens
  useEffect(() => {
    if (isMobileSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isMobileSearchOpen])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
        closeMobileSearch()
      }
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowUserMenu(false)
        if (isMobileSearchOpen) {
          closeMobileSearch()
        }
      }
    }

    if (showUserMenu || isMobileSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [showUserMenu, isMobileSearchOpen])

  const handleSignInClick = () => {
    setAuthMode("signin")
    setShowAuthModal(true)
  }

  const handleSignUpClick = () => {
    setAuthMode("signup")
    setShowAuthModal(true)
  }

  const handleLogout = async () => {
    setShowUserMenu(false)
    try {
      await logout()
      showGoodbyeToast()
    } catch (error) {
      console.error('Logout error:', error)
      // Logout should still work even if there's an error
      showGoodbyeToast()
    }
  }

  // Handle search input changes with debouncing
  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setLocalSearchQuery(value)
    
    if (value.trim()) {
      setIsSearching(true)
      debouncedSearch(value)
    } else {
      // Immediate clear when search is empty
      setIsSearching(false)
      if (onSearch) {
        onSearch("")
      }
    }
  }

  const clearSearch = () => {
    setLocalSearchQuery("")
    setIsSearching(false)
    if (onSearch) {
      onSearch("")
    }
  }

  const openMobileSearch = () => {
    setIsMobileSearchOpen(true)
  }

  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false)
    // Clear search when closing mobile search
    clearSearch()
  }

  const handleAuthSuccess = (userData, isRegistration = false) => {
    console.log('Authentication successful:', userData)
    
    // Show appropriate welcome toast
    if (isRegistration) {
      showRegistrationToast(userData?.username || userData?.name)
    } else {
      showWelcomeToast(userData?.username || userData?.name)
    }
  }

  return (
    <>
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-md sticky top-0 z-30">
        {/* Mobile Search Overlay */}
        {isMobileSearchOpen && (
          <div className="lg:hidden absolute inset-0 bg-white dark:bg-gray-800 z-40 flex items-center justify-center px-4 py-4">
            <div className="relative flex max-w-full">
              {/* Search Icon with loading state */}
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                {isSearching ? (
                  <PuffLoader
                    color="#7C3AED"
                    size={16}
                    loading={true}
                  />
                ) : (
                  <Search className="text-black dark:text-gray-400 w-5 h-5" />
                )}
              </div>
              
              <input
                ref={searchInputRef}
                type="text"
                placeholder={isSearching ? "Searching..." : "Search songs, artists ..."}
                value={localSearchQuery}
                onChange={handleSearchInputChange}
                on={closeMobileSearch}
                className={`w-full pl-12 pr-12 py-2 bg-gray-100/80 dark:bg-gray-700/80 rounded-2xl border-gray-500/5 border-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-purple-100 dark:focus:bg-purple-900/20 backdrop-blur-sm transition-all duration-300 ${
                  isSearching ? 'bg-purple-50 dark:bg-purple-900/10' : ''
                }`}
              />
              
              <button
                onClick={closeMobileSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Navbar */}
        <div className={`px-3 sm:px-4 lg:px-6 py-3 sm:py-4 transition-opacity duration-300 ${isMobileSearchOpen ? 'opacity-0 lg:opacity-100' : 'opacity-100'}`}>
          <div className="flex items-center justify-between">
            {/* Mobile Layout: Menu - Search - Logo - Theme - Auth */}
            <div className="lg:hidden flex items-center justify-between w-full">
              {/* Left: Menu + Search Icon */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={onMenuClick}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                
                <button
                  onClick={openMobileSearch}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {/* Center: Logo + App Name */}
              <Link to="/" className="flex items-center space-x-2 absolute left-1/2 transform -translate-x-1/2">
                <span className="font-bold text-lg sm:text-xl bg-gradient-to-bl from-purple-600 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                  StreamFlow
                </span>
              </Link>

              {/* Right: Theme + Auth */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Mobile Auth */}
                {!isAuthenticated ? (
                  <div className="flex items-center">
                    {authLoading ? (
                      <div className="p-2">
                        <PuffLoader
                          color="#7C3AED"
                          size={20}
                          loading={true}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={handleSignInClick}
                        className="px-2 py-2 bg-gradient-to-bl from-purple-600 via-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:via-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium text-sm"
                      >
                        Sign In
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 group"
                      title={`Logged in as ${user?.username || user?.name || 'User'}`}
                    >
                      {user?.profileImg != "No Profile Picture" ? (
                        <img
                          src={user.profileImg}
                          alt={user.username || user.name}
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-purple-400 dark:border-purple-600 group-hover:border-purple-600 dark:group-hover:border-purple-800 transition-colors"
                        />
                      ) : (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-bl from-purple-600 via-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:from-purple-700 group-hover:via-purple-700 group-hover:to-blue-700 transition-all duration-300">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                      )}
                    </button>

                    {/* Mobile User Menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-3 z-50">
                        <div className="px-4 py-2 border-b border-gray-200/50 dark:border-gray-700/50 mb-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {user?.username || user?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user?.email}
                          </p>
                        </div>

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
                          onClick={handleLogout}
                          disabled={authLoading}
                          className="flex items-center px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors rounded-xl mx-2 w-11/12 text-left disabled:opacity-50 group"
                        >
                          {authLoading ? (
                            <>
                              <PuffLoader
                                color="#DC2626"
                                size={14}
                                loading={true}
                              />
                              <span className="ml-3">Logging out...</span>
                            </>
                          ) : (
                            <>
                              <LogOut className="w-4 h-4 mr-3" />
                              Logout
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Layout: Logo - Home - Search - Theme - Auth */}
            <div className="hidden lg:flex items-center justify-between w-full space-x-5">
              {/* Left side: Logo */}
              <div className="flex items-center space-x-4">
                <Link to="/" className="flex items-center space-x-3 mr-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                    <img src={logoImage} alt="logo" />
                  </div>
                  <span className="font-bold text-2xl bg-gradient-to-bl from-purple-600 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                    StreamFlow
                  </span>
                </Link>
              </div>

              {/* Center - Home Icon and Search Bar */}
              <div className="flex items-center space-x-4 flex-1 justify-center max-w-2xl">
                <Link
                  to="/"
                  className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                    isHome
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <Home className="w-5 h-5" />
                </Link>

                <div className="relative flex-1 max-w-lg">
                  {/* Search Icon with loading state */}
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    {isSearching ? (
                      <PuffLoader
                        color="#7C3AED"
                        size={16}
                        loading={true}
                      />
                    ) : (
                      <Search className="text-black dark:text-gray-400 w-5 h-5" />
                    )}
                  </div>
                  
                  <input
                    type="text"
                    placeholder={isSearching ? "Searching..." : "Search songs, artists ..."}
                    value={localSearchQuery}
                    onChange={handleSearchInputChange}
                    className={`w-full pl-12 pr-12 py-3 bg-gray-100/80 dark:bg-gray-700/80 rounded-2xl border-gray-500/5 border-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-purple-100 dark:focus:bg-purple-900/20 backdrop-blur-sm transition-all duration-300 ${
                      isSearching ? 'bg-purple-50 dark:bg-purple-900/10' : ''
                    }`}
                  />
                  
                  {localSearchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Right side: Theme + Auth */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleTheme}
                  className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-110"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Desktop Authentication buttons or User menu */}
                {!isAuthenticated ? (
                  <div className="flex items-center space-x-2">
                    {authLoading ? (
                      <div className="flex items-center space-x-3 px-4 py-2">
                        <PuffLoader
                          color="#7C3AED"
                          size={20}
                          loading={true}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Loading...
                        </span>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={handleSignUpClick}
                          className="px-4 py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-xl transition-all duration-300 font-medium"
                        >
                          Sign Up
                        </button>
                        <button
                          onClick={handleSignInClick}
                          className="px-4 py-2 bg-gradient-to-bl from-purple-600 via-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:via-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
                        >
                          Sign In
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 group"
                      title={`Logged in as ${user?.username || user?.name || 'User'}`}
                    >
                      {user?.profileImg != "No Profile Picture" ? (
                        <img
                          src={user.profileImg}
                          alt={user.username || user.name}
                          className="w-8 h-8 rounded-full object-cover border-2 border-purple-400 dark:border-purple-600 group-hover:border-purple-600 dark:group-hover:border-purple-800 transition-colors"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-bl from-purple-600 via-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:from-purple-700 group-hover:via-purple-700 group-hover:to-blue-700 transition-all duration-300 group-hover:shadow-xl">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <span className="text-sm font-medium">
                        {user?.username || user?.name || 'User'}
                      </span>
                    </button>

                    {/* Desktop User Menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-3 z-50">
                        <div className="px-4 py-2 border-b border-gray-200/50 dark:border-gray-700/50 mb-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {user?.username || user?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user?.email}
                          </p>
                        </div>

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
                          onClick={handleLogout}
                          disabled={authLoading}
                          className="flex items-center px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors rounded-xl mx-2 w-11/12 text-left disabled:opacity-50 group"
                        >
                          {authLoading ? (
                            <>
                              <PuffLoader
                                color="#DC2626"
                                size={14}
                                loading={true}
                              />
                              <span className="ml-3">Logging out...</span>
                            </>
                          ) : (
                            <>
                              <LogOut className="w-4 h-4 mr-3" />
                              Logout
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Authentication Modal */}
      <AuthenticationModals
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
        showAuthToast={showAuthToast}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </>
  )
}