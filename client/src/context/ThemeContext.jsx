import { createContext, useContext, useReducer, useEffect, useState } from "react"

const ThemeContext = createContext()

const initialState = {
  isDark: true,
  isSystemPreference: false,
}

function themeReducer(state, action) {
  switch (action.type) {
    case "SET_THEME":
      return { 
        ...state, 
        isDark: action.payload,
        isSystemPreference: false 
      }
    case "TOGGLE_THEME":
      return { 
        ...state, 
        isDark: !state.isDark,
        isSystemPreference: false 
      }
    case "LOAD_THEME":
      return { 
        ...state, 
        isDark: action.payload.isDark,
        isSystemPreference: action.payload.isSystemPreference 
      }
    case "SET_SYSTEM_PREFERENCE":
      return { 
        ...state, 
        isDark: action.payload,
        isSystemPreference: true 
      }
    default:
      return state
  }
}

export function ThemeProvider({ children }) {
  const [state, dispatch] = useReducer(themeReducer, initialState)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme")
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      
      if (savedTheme) {
        // User has a saved preference
        dispatch({ 
          type: "LOAD_THEME", 
          payload: { 
            isDark: savedTheme === "dark",
            isSystemPreference: false 
          } 
        })
      } else {
        // No saved preference, use system preference
        dispatch({ 
          type: "SET_SYSTEM_PREFERENCE", 
          payload: prefersDark 
        })
      }
    } catch (error) {
      console.error("Error loading theme from localStorage:", error)
      // Fallback to system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      dispatch({ type: "SET_SYSTEM_PREFERENCE", payload: prefersDark })
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // Save theme to localStorage when it changes (but not during initial load)
  useEffect(() => {
    if (!isInitialized) return // Don't save during initial load
    
    try {
      localStorage.setItem("theme", state.isDark ? "dark" : "light")
    } catch (error) {
      console.error("Error saving theme to localStorage:", error)
    }
  }, [state.isDark, isInitialized])

  // Apply theme to document
  useEffect(() => {
    if (state.isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [state.isDark])

  useEffect(() => {
    if (!state.isSystemPreference) return 

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (e) => {
      dispatch({ type: "SET_SYSTEM_PREFERENCE", payload: e.matches })
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [state.isSystemPreference])

  const toggleTheme = () => {
    dispatch({ type: "TOGGLE_THEME" })
  }

  const setTheme = (isDark) => {
    dispatch({ type: "SET_THEME", payload: isDark })
  }

  const resetToSystemPreference = () => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    dispatch({ type: "SET_SYSTEM_PREFERENCE", payload: prefersDark })

    try {
      localStorage.removeItem("theme")
    } catch (error) {
      console.error("Error removing theme from localStorage:", error)
    }
  }

  const contextValue = {
    isDark: state.isDark,
    isSystemPreference: state.isSystemPreference,
    toggleTheme,
    setTheme,
    resetToSystemPreference,
    dispatch, // If i need direct access to dispatch
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}