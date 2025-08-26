import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../sidebars/Sidebar"
import Navbar from "../navbar/Navbar"
import RightSidebar from "../sidebars/RightSidebar"
import AudioPlayer from '../audioPlayer/AudioPlayer';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

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
        setIsAuthenticated={setIsAuthenticated}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-6">
            <Outlet context={{ searchQuery, clearSearch, isAuthenticated, setIsAuthenticated }} />
          </div>
        </main>
        <RightSidebar isOpen={isRightSidebarOpen} onClose={() => setIsRightSidebarOpen(false)} />
      </div>
      <AudioPlayer onToggleRightSidebar={toggleRightSidebar} isRightSidebarOpen={isRightSidebarOpen} />
    </div>
  )
}