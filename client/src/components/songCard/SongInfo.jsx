// components/songCard/SongInfo.jsx (Complete Implementation)
import React from 'react'
import { MoreHorizontal } from 'lucide-react'
import SongMenu from './SongMenu'

export default function SongInfo({
    displayTitle,
    displayArtist,
    rawArtist,
    displayDuration,
    isCurrentSong,
    isEditMode,
    isAuthenticated,
    showMenu,
    menuRef,
    onMenuToggle,
    onMenuOption,
    onAuthRequired,
    isInQueue,
    isUploaded
}) {
    return (
        <div className="space-y-0.5 sm:space-y-1">
            <h3
                className={`font-semibold text-xs sm:text-sm truncate leading-tight ${isCurrentSong ? 'text-purple-600 dark:text-purple-400' : ''
                    }`}
                title={displayTitle}
            >
                {displayTitle}
            </h3>
            <p
                className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs truncate leading-tight"
                title={rawArtist}
            >
                {displayArtist}
            </p>
            <div className="flex items-center justify-between pt-0.5">
                <span className="text-gray-500 dark:text-gray-500 text-[9px] sm:text-xs font-medium bg-gray-100 dark:bg-gray-700 px-1 sm:px-1.5 py-0.5 rounded-full">
                    {displayDuration}
                </span>

                {/* More options menu */}
                {!isEditMode && (
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={onMenuToggle}
                            className={`p-0.5 sm:p-1 rounded-full transition-colors ${isAuthenticated
                                    ? "hover:bg-gray-100 dark:hover:bg-gray-700"
                                    : "hover:bg-purple-100 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400"
                                }`}
                            title={isAuthenticated ? "More options" : "Sign in for more options"}
                        >
                            <MoreHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>

                        {showMenu && (
                            <SongMenu
                                isAuthenticated={isAuthenticated}
                                isInQueue={isInQueue}
                                isUploaded={isUploaded}
                                onMenuOption={onMenuOption}
                                onAuthRequired={onAuthRequired}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
