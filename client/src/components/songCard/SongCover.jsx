// components/songCard/SongCover.jsx
import React from 'react'
import { Play, Pause, Heart, Edit2, ListMusic } from 'lucide-react'

export default function SongCover({
    displayCover,
    displayTitle,
    isUploaded,
    displayGenre,
    isInQueue,
    isCurrentSong,
    isEditMode,
    isHovered,
    isPlaying,
    isAuthenticated,
    isFavorite,
    onEditClick,
    onPlayPause,
    onFavorite
}) {
    return (
        <div className="relative mb-2 sm:mb-3">
            {/* Status badges */}
            <div className="absolute top-1 sm:top-2 left-1 sm:left-2 flex flex-col gap-1 z-10">
                {isUploaded && (
                    <div className="bg-green-500 text-white text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full font-medium">
                        Uploaded
                    </div>
                )}
                {displayGenre && !isUploaded && (
                    <div className="bg-purple-500 text-white text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full font-medium">
                        {displayGenre}
                    </div>
                )}
            </div>

            {/* Queue indicator */}
            {isInQueue && !isCurrentSong && (
                <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-blue-500 text-white text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full font-medium z-10 flex items-center">
                    <ListMusic className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                </div>
            )}

            <img
                src={displayCover}
                alt={`${displayTitle} cover`}
                className="w-full aspect-square object-cover rounded-md sm:rounded-lg"
                onError={(e) => {
                    e.target.src = "https://placehold.co/200x200/EFEFEF/AAAAAA?text=Song+Cover"
                }}
            />

            {/* Edit mode overlay */}
            {isEditMode && (
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-md sm:rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <button
                        onClick={onEditClick}
                        className="bg-purple-500 hover:bg-purple-600 text-white p-2 sm:p-2.5 rounded-full shadow-lg transition-colors"
                        title="Edit song"
                    >
                        <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                </div>
            )}

            {/* Play controls overlay */}
            {!isEditMode && (
                <div
                    className={`absolute inset-0 bg-black bg-opacity-40 rounded-md sm:rounded-lg flex items-center justify-center transition-opacity duration-200 ${isHovered || isPlaying ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <button
                        onClick={onPlayPause}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg ${isAuthenticated
                                ? "bg-white text-gray-900"
                                : "bg-purple-500 text-white hover:bg-purple-600"
                            }`}
                        title={isAuthenticated ? (isPlaying ? "Pause" : "Play") : "Sign in to play music"}
                    >
                        {isAuthenticated && isPlaying ? (
                            <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        ) : (
                            <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-0.5" />
                        )}
                    </button>
                </div>
            )}

            {/* Favorite button */}
            {!isEditMode && (
                <button
                    onClick={onFavorite}
                    className={`absolute bottom-1 sm:bottom-2 right-1 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all ${!isAuthenticated
                            ? "bg-gray-500 bg-opacity-70 text-gray-300 hover:bg-purple-500 hover:text-white hover:bg-opacity-90"
                            : isFavorite
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                        }`}
                    title={!isAuthenticated ? "Sign in to add to favorites" : (isFavorite ? "Remove from favorites" : "Add to favorites")}
                >
                    <Heart className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${isFavorite && isAuthenticated ? "fill-current" : ""}`} />
                </button>
            )}
        </div>
    )
}