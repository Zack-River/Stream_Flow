import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import Navbar from "../navbar/Navbar"
import Sidebar from "../sidebars/Sidebar"
import RightSidebar from "../sidebars/RightSidebar"
import AudioPlayer from "../audioPlayer/AudioPlayer"
import { useMusic } from "../../context/MusicContext"

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const { state } = useMusic()

  // Close sidebar on mobile when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleToggleRightSidebar = () => {
    setIsRightSidebarOpen(!isRightSidebarOpen)
  }

  const hasCurrentSong = !!state.currentSong

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-4 py-2 rounded-lg z-50"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header role="banner" aria-label="Application header">
        <Navbar onMenuClick={handleMenuClick} />
      </header>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />

        {/* Main Content */}
        <main 
          id="main-content"
          className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900"
          role="main"
          aria-label="Main content area"
        >
          <div className="p-6">
            <Outlet />
          </div>
        </main>

        {/* Right Sidebar - Only show when there's a current song */}
        {hasCurrentSong && (
          <RightSidebar 
            isOpen={isRightSidebarOpen} 
            onClose={() => setIsRightSidebarOpen(false)}
          />
        )}
      </div>

      {/* Audio Player - Only show when there's a current song */}
      {hasCurrentSong && (
        <AudioPlayer 
          onToggleRightSidebar={handleToggleRightSidebar}
          isRightSidebarOpen={isRightSidebarOpen}
        />
      )}
    </div>
  )
}