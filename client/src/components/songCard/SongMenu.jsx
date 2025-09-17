// components/songCard/SongMenu.jsx (Complete Implementation)  
import React from 'react'
import { Plus, PlayCircle, Music, Trash2 } from 'lucide-react'

export default function SongMenu({
    isAuthenticated,
    isInQueue,
    isUploaded,
    onMenuOption,
    onAuthRequired
}) {
    if (!isAuthenticated) {
        return (
            <div className="absolute bottom-0 right-0 mb-8 w-36 sm:w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-20">
                <div className="px-3 py-2">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center mb-2">
                        Sign in to access menu options
                    </p>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            if (onAuthRequired) {
                                onAuthRequired('signin')
                            }
                        }}
                        className="w-full text-center px-2 py-1 text-[10px] bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="absolute bottom-0 right-0 mb-8 w-36 sm:w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-20">
            <button
                onClick={(e) => onMenuOption("queue", e)}
                disabled={isInQueue}
                className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center space-x-2 ${isInQueue
                        ? "text-gray-400 cursor-not-allowed"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
            >
                <Plus className="w-3 h-3" />
                <span>{isInQueue ? "In Queue" : "Add to Queue"}</span>
            </button>

            <button
                onClick={(e) => onMenuOption("play-next", e)}
                className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
                <PlayCircle className="w-3 h-3" />
                <span>Play Next</span>
            </button>

            <hr className="my-1 border-gray-200 dark:border-gray-700" />

            <button
                onClick={(e) => onMenuOption("playlist", e)}
                className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
                <Music className="w-3 h-3" />
                <span>Add to Playlist</span>
            </button>

            {isUploaded && (
                <>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                        onClick={(e) => onMenuOption("delete", e)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors flex items-center space-x-2"
                    >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                    </button>
                </>
            )}
        </div>
    )
}