import { useState } from "react"
import { Outlet } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useMusic } from "../../context/MusicContext"
import Sidebar from "../sidebars/Sidebar"
import Navbar from "../navbar/Navbar"
import RightSidebar from "../sidebars/RightSidebar"
import AudioPlayer from '../audioPlayer/AudioPlayer'
import MusicErrorBoundary from '../errorBoundary/MusicErrorBoundary'
import { AudioPlayerSkeleton } from '../loading/LoadingStates'

export default function Layout() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { state } = useMusic()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Check if there's a current song to determine if audio player should be shown
  const hasCurrentSong = !!state.currentSong
  const isAudioLoading = hasCurrentSong && state.isSkipping

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
      <MusicErrorBoundary 
        fallbackMessage="There was an issue with the navigation"
        onReset={() => {
          setSearchQuery("")
          setIsSidebarOpen(false)
          setIsRightSidebarOpen(false)
        }}
      >
        <Navbar 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          onSearch={handleSearch}
          searchQuery={searchQuery}
          isAuthenticated={isAuthenticated}
          authLoading={authLoading}
        />
      </MusicErrorBoundary>

      <div className="flex flex-1 overflow-hidden">
        <MusicErrorBoundary fallbackMessage="There was an issue with the sidebar">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </MusicErrorBoundary>
        
        {/* Main content with padding bottom when audio player is visible */}
        <main className={`flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 ${
          hasCurrentSong ? 'pb-36 sm:pb-24 lg:pb-24' : ''
        }`}>
          <div className="p-3 sm:p-4 lg:p-6">
            <MusicErrorBoundary 
              fallbackMessage="There was an issue loading this page"
              onReset={() => clearSearch()}
            >
              <Outlet context={{ 
                searchQuery, 
                clearSearch, 
                isAuthenticated, 
                authLoading 
              }} />
            </MusicErrorBoundary>
          </div>
        </main> 
        
        {/* Right sidebar only shown on larger screens by default */}
        <div className="hidden lg:block">
          <MusicErrorBoundary fallbackMessage="There was an issue with the queue">
            <RightSidebar isOpen={isRightSidebarOpen} onClose={() => setIsRightSidebarOpen(false)} />
          </MusicErrorBoundary>
        </div>
        
        {/* Right sidebar as overlay on smaller screens */}
        <div className="lg:hidden">
          {isRightSidebarOpen && (
            <MusicErrorBoundary fallbackMessage="There was an issue with the queue">
              <RightSidebar isOpen={isRightSidebarOpen} onClose={() => setIsRightSidebarOpen(false)} />
            </MusicErrorBoundary>
          )}
        </div>
      </div>
      
      {/* Fixed Audio Player - positioned absolutely to viewport bottom */}
      {hasCurrentSong && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <MusicErrorBoundary 
            fallbackMessage="There was an issue with the audio player"
            onReset={() => {
              // Reset audio player state if needed
              window.location.reload()
            }}
          >
            {isAudioLoading ? (
              <AudioPlayerSkeleton />
            ) : (
              <AudioPlayer 
                onToggleRightSidebar={toggleRightSidebar} 
                isRightSidebarOpen={isRightSidebarOpen} 
              />
            )}
          </MusicErrorBoundary>
        </div>
      )}
    </div>
  )
}