import { useState } from "react"
import { Edit2, X, Upload } from "lucide-react"
import { useMusic } from "../../context/MusicContext"
import SongCard from "../songCard/SongCard.jsx"
import UploadModal from "./UploadModal"

export default function UploadsPage() {
  const { state } = useMusic()
  const [isEditMode, setIsEditMode] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editingSong, setEditingSong] = useState(null)

  const songs = state.uploads || []

  const handleEditClick = (song) => {
    setEditingSong(song)
    setShowUploadModal(true)
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
  }

  const handleUploadModalClose = () => {
    setShowUploadModal(false)
    setEditingSong(null)
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Header with Edit Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Your Uploads
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{songs.length} {songs.length === 1 ? 'song' : 'songs'}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 self-start sm:self-center">
            {isEditMode ? (
              <button
                onClick={handleCancelEdit}
                className="btn-ghost flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-sm"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditMode(true)}
                className="btn-ghost flex items-center space-x-2 px-3 sm:px-4 py-2 cursor-pointer rounded-lg sm:rounded-xl hover:text-purple-600 dark:hover:text-purple-400 text-sm"
                disabled={songs.length === 0}
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Songs</span>
              </button>
            )}
          </div>
        </div>

        {/* Edit Mode Instructions */}
        {isEditMode && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-start space-x-3">
              <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
              <p className="text-purple-800 dark:text-purple-300 font-medium text-sm sm:text-base leading-relaxed">
                Edit mode enabled. Tap on songs and click the edit button to modify their details.
              </p>
            </div>
          </div>
        )}

        {/* Songs Grid */}
        {songs.length === 0 ? (
          <div className="text-center py-8 sm:py-10 px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
              No songs uploaded yet
            </h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-6 sm:mb-8 max-w-sm mx-auto leading-relaxed">
              Start building your music library by uploading your favorite songs.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {songs.map((song) => (
              <div key={song.id} className="group">
                <SongCard
                  song={song}
                  isEditMode={isEditMode}
                  onEditClick={handleEditClick}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload/Edit Modal */}
      {showUploadModal && (
        <UploadModal 
          onClose={handleUploadModalClose} 
          editSong={editingSong}
        />
      )}
    </>
  )
}