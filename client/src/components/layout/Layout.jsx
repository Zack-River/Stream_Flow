import { useState } from "react"
import { Outlet } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Sidebar from "../sidebars/Sidebar"
import Navbar from "../navbar/Navbar"
import RightSidebar from "../sidebars/RightSidebar"
import AudioPlayer from '../audioPlayer/AudioPlayer';

export default function Layout() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  // MOBILE: Start with right sidebar closed on mobile, open on desktop
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const toggleRightSidebar = () => {
    setIsRightSidebarOpen(!isRightSidebarOpen)
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        onSearch={handleSearch}
        searchQuery={searchQuery}
        isAuthenticated={isAuthenticated}
        authLoading={authLoading}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        {/* MOBILE-FIRST: Reduced padding from p-6 to p-3 on mobile, increased on larger screens */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-3 sm:p-4 lg:p-6">
            <Outlet context={{ 
              searchQuery, 
              clearSearch, 
              isAuthenticated, 
              authLoading 
            }} />
          </div>
        </main> 
        
        {/* MOBILE: Right sidebar only shown on larger screens by default */}
        <div className="hidden lg:block">
          <RightSidebar isOpen={isRightSidebarOpen} onClose={() => setIsRightSidebarOpen(false)} />
        </div>
        
        {/* MOBILE: Right sidebar as overlay on smaller screens */}
        <div className="lg:hidden">
          {isRightSidebarOpen && (
            <RightSidebar isOpen={isRightSidebarOpen} onClose={() => setIsRightSidebarOpen(false)} />
          )}
        </div>
      </div>
      
      {/* MOBILE: Audio player remains fixed at bottom with mobile-first design */}
      <AudioPlayer onToggleRightSidebar={toggleRightSidebar} isRightSidebarOpen={isRightSidebarOpen} />
    </div>
  )
}