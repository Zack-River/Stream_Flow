import { useState } from "react"
import { Outlet } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useMusic } from "../../context/MusicContext"
import Sidebar from "../sidebars/Sidebar"
import Navbar from "../navbar/Navbar"
import RightSidebar from "../sidebars/RightSidebar"
import AudioPlayer from '../audioPlayer/AudioPlayer';

export default function Layout() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { state } = useMusic()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Check if there's a current song to determine if audio player should be shown
  const hasCurrentSong = !!state.currentSong

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
        
        {/* Main content with padding bottom when audio player is visible */}
        <main className={`flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 ${
          hasCurrentSong ? 'pb-36 sm:pb-24 lg:pb-24' : ''
        }`}>
          <div className="p-3 sm:p-4 lg:p-6">
            <Outlet context={{ 
              searchQuery, 
              clearSearch, 
              isAuthenticated, 
              authLoading 
            }} />
          </div>
        </main> 
        
        {/* Right sidebar only shown on larger screens by default */}
        <div className="hidden lg:block">
          <RightSidebar isOpen={isRightSidebarOpen} onClose={() => setIsRightSidebarOpen(false)} />
        </div>
        
        {/* Right sidebar as overlay on smaller screens */}
        <div className="lg:hidden">
          {isRightSidebarOpen && (
            <RightSidebar isOpen={isRightSidebarOpen} onClose={() => setIsRightSidebarOpen(false)} />
          )}
        </div>
      </div>
      
      {/* Fixed Audio Player - positioned absolutely to viewport bottom */}
      {hasCurrentSong && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <AudioPlayer 
            onToggleRightSidebar={toggleRightSidebar} 
            isRightSidebarOpen={isRightSidebarOpen} 
          />
        </div>
      )}
    </div>
  )
}