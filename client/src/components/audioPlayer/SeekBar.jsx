import React, { useState, useEffect } from 'react'
import { formatTime } from '../../utils/audioUtils'

export default function SeekBar({ currentTime, duration, onSeek, isSkipping }) {
    const [isDragging, setIsDragging] = useState(false)
    const [dragValue, setDragValue] = useState(0)
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

    const progressPercentage = duration && duration > 0
        ? Math.max(0, Math.min(100, (currentTime / duration) * 100))
        : 0

    const handleSeekStart = (e) => {
        console.log('🎯 Seek start')
        setIsDragging(true)
        const newTime = parseFloat(e.target.value)
        setDragValue(newTime)
    }

    const handleSeekChange = (e) => {
        if (!isDragging) return
        const newTime = parseFloat(e.target.value)
        setDragValue(newTime)
    }

    const handleSeekEnd = (e) => {
        if (!isDragging) return

        const newTime = parseFloat(e.target.value)
        const clampedTime = Math.max(0, Math.min(newTime, duration || 0))

        console.log('🎯 Seek end:', clampedTime)
        onSeek(clampedTime)
        setIsDragging(false)
        setDragValue(0)
    }

    const displayTime = isDragging ? dragValue : currentTime

    return (
        <div className="flex items-center space-x-2 sm:space-x-3 w-full">
            <span className="text-xs text-gray-500 font-mono w-8 sm:w-10 text-left flex-shrink-0">
                {formatTime(displayTime)}
            </span>

            <div className="flex-1 relative">
                <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={displayTime || 0}
                    onMouseDown={handleSeekStart}
                    onTouchStart={handleSeekStart}
                    onChange={handleSeekChange}
                    onMouseUp={handleSeekEnd}
                    onTouchEnd={handleSeekEnd}
                    disabled={isSkipping}
                    className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer select-none disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                        background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${progressPercentage}%, ${isDarkMode ? "#374151" : "#e5e7eb"
                            } ${progressPercentage}%, ${isDarkMode ? "#374151" : "#e5e7eb"
                            } 100%)`,
                    }}
                />
            </div>

            <span className="text-xs text-gray-500 font-mono w-8 sm:w-10 text-right flex-shrink-0">
                {formatTime(duration)}
            </span>
        </div>
    )
}