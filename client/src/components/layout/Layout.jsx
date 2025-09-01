// components/layout/Layout.jsx
import { useState } from "react"
import { Outlet } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Sidebar from "../sidebars/Sidebar"
import Navbar from "../navbar/Navbar"
import RightSidebar from "../sidebars/RightSidebar"
import AudioPlayer from '../audioPlayer/AudioPlayer'
import LoadingSpinner from '../common/LoadingSpinner'
import DebugAuthStatus from '../debug/DebugAuthStatus'
import AuthSessionManager from '../authentication/AuthSessionManager'

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  const { isAuthenticated, isLoading } = useAuth()

  const toggleRightSidebar = () => {
    setIsRightSidebarOpen(!isRightSidebarOpen)
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  // Show loading spinner while checking authentication status
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner message="Checking authentication..." />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Session Manager - handles automatic token refresh and session validation */}
      <AuthSessionManager />
      
      <Navbar 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        onSearch={handleSearch}
        searchQuery={searchQuery}
        isAuthenticated={isAuthenticated}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-6">
            <Outlet context={{ searchQuery, clearSearch, isAuthenticated }} />
          </div>
        </main>
        <RightSidebar isOpen={isRightSidebarOpen} onClose={() => setIsRightSidebarOpen(false)} />
      </div>
      <AudioPlayer onToggleRightSidebar={toggleRightSidebar} isRightSidebarOpen={isRightSidebarOpen} />
      <DebugAuthStatus />
    </div>
  )
}