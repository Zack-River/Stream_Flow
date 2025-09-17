import React from 'react'
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from 'lucide-react'

export default function PlayerControls({
    isPlaying,
    isShuffled,
    repeatMode,
    isSkipping,
    hasNext,
    hasPrevious,
    onPlayPause,
    onSkipNext,
    onSkipPrevious,
    onShuffle,
    onRepeat
}) {
    const getRepeatIcon = () => {
        switch (repeatMode) {
            case 'one':
                return <Repeat1 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            case 'all':
            case 'off':
            default:
                return <Repeat className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        }
    }

    const getRepeatButtonStyle = () => {
        switch (repeatMode) {
            case 'one':
            case 'all':
                return "text-purple-500 hover:text-purple-600 bg-purple-50 dark:bg-purple-900/20"
            case 'off':
            default:
                return "hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
        }
    }

    return (
        <div className="flex items-center justify-center space-x-2 sm:space-x-4">
            <button
                onClick={onShuffle}
                disabled={isSkipping}
                className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${isShuffled
                        ? "text-purple-500 hover:text-purple-600 bg-purple-50 dark:bg-purple-900/20"
                        : "hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
            >
                <Shuffle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
                onClick={onSkipPrevious}
                disabled={isSkipping || !hasPrevious()}
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
                onClick={onPlayPause}
                disabled={isSkipping}
                className="w-10 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none"
            >
                {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />}
            </button>

            <button
                onClick={onSkipNext}
                disabled={isSkipping || !hasNext()}
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
                onClick={onRepeat}
                disabled={isSkipping}
                className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${getRepeatButtonStyle()}`}
                title={`Repeat: ${repeatMode === 'off' ? 'Off' : repeatMode === 'all' ? 'All' : 'One'}`}
            >
                {getRepeatIcon()}
            </button>
        </div>
    )
}