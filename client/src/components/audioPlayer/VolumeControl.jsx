// components/audioPlayer/VolumeControl.jsx (Complete Implementation)
import React, { useState, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

export default function VolumeControl({
    volume,
    isMobile,
    showSlider,
    onVolumeChange,
    onMute,
    onToggleSlider,
    refs
}) {
    const [isDarkMode, setIsDarkMode] = useState(false)

    useEffect(() => {
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'))
        }

        checkDarkMode()
        const observer = new MutationObserver(checkDarkMode)
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        })

        return () => observer.disconnect()
    }, [])

    const handleVolumeClick = () => {
        if (isMobile) {
            onToggleSlider()
        } else {
            onMute()
        }
    }

    return (
        <>
            <div className="flex items-center space-x-1 lg:space-x-2 justify-end relative">
                {/* Volume Icon */}
                <button
                    ref={refs.button}
                    onClick={handleVolumeClick}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                    {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Volume Slider */}
                {!isMobile && (
                    <div className="hidden md:flex h-6 items-center">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                            className="w-16 lg:w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${volume * 100}%, ${isDarkMode ? "#374151" : "#e5e7eb"
                                    } ${volume * 100}%, ${isDarkMode ? "#374151" : "#e5e7eb"} 100%)`,
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Mobile Volume Dropdown */}
            {showSlider && isMobile && (
                <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
                    <div
                        ref={refs.modal}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-64"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium">Volume</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{Math.round(volume * 100)}%</span>
                        </div>

                        <div className="space-y-3">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                                className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${volume * 100}%, ${isDarkMode ? "#374151" : "#e5e7eb"
                                        } ${volume * 100}%, ${isDarkMode ? "#374151" : "#e5e7eb"} 100%)`,
                                }}
                            />

                            <button
                                onClick={onMute}
                                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                            >
                                {volume === 0 ? 'Unmute' : 'Mute'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}