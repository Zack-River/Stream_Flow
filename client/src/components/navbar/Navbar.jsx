import { useState, useRef, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { useTheme } from "../../context/ThemeContext"
import logoImage from "../../assets/logo.png"
import { Search, Home, Menu, Sun, Moon, User, Settings, LogOut } from "lucide-react"

export default function Navbar({ onMenuClick }) {
  const { isDark, toggleTheme } = useTheme()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const location = useLocation()

  const userMenuRef = useRef(null)
  const searchInputRef = useRef(null)

  // Check if current page is home
  const isHome = location.pathname === '/'

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

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    // Implement search functionality
    console.log("Searching for:", searchQuery)
  }

  const handleThemeToggle = () => {
    toggleTheme()
  }

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu)
  }

  return (
    <nav 
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-md px-6 py-4 sticky top-0 z-30"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle sidebar menu"
            aria-expanded="false"
            aria-controls="sidebar-menu"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>

          <Link 
            to="/" 
            className="flex items-center space-x-3 mr-4"
            aria-label="StreamFlow home page"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center">
              <img 
                src={logoImage} 
                alt="StreamFlow logo" 
                width="48" 
                height="48"
                className="w-full h-full object-contain"
              />
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
            className={`hidden lg:block p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              isHome 
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" 
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            }`}
            aria-label="Go to home page"
            aria-current={isHome ? "page" : undefined}
          >
            <Home className="w-5 h-5" aria-hidden="true" />
          </Link>
          
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
            <label htmlFor="search-input" className="sr-only">
              Search songs and artists
            </label>
            <Search 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black dark:text-gray-400 w-5 h-5" 
              aria-hidden="true"
            />
            <input
              id="search-input"
              type="search"
              placeholder="Search songs, artists ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100/80 dark:bg-gray-700/80 rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-purple-100 dark:focus:bg-purple-900/20 backdrop-blur-sm transition-all duration-300"
              aria-label="Search for songs and artists"
              ref={searchInputRef}
            />
          </form>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleThemeToggle}
            className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-110"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            aria-pressed={isDark}
          >
            {isDark ? (
              <Sun className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Moon className="w-5 h-5" aria-hidden="true" />
            )}
          </button>

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={handleUserMenuToggle}
              className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg"
              aria-label="User menu"
              aria-expanded={showUserMenu}
              aria-haspopup="true"
              aria-controls="user-menu"
            >
              <User className="w-5 h-5 text-white" aria-hidden="true" />
            </button>

            {showUserMenu && (
              <div 
                id="user-menu"
                className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-3 z-50"
                role="menu"
                aria-label="User menu options"
              >
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-xl mx-2 w-11/12 text-left"
                  role="menuitem"
                >
                  <User className="w-4 h-4 mr-3" aria-hidden="true" />
                  Profile
                </button>

                <button
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-xl mx-2 w-11/12 text-left"
                  role="menuitem"
                >
                  <Settings className="w-4 h-4 mr-3" aria-hidden="true" />
                  Settings
                </button>

                <hr className="my-2 border-gray-200/50 dark:border-gray-700/50 mx-4" role="separator" />

                <button
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors rounded-xl mx-2 w-11/12 text-left"
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4 mr-3" aria-hidden="true" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}