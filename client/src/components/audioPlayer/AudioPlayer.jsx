import { useState, useRef, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Repeat1, Heart, PanelRightOpen, Import } from "lucide-react"
import { useMusic } from "../../context/MusicContext"
import { formatTime } from "../../utils/audioUtils" 

export default function AudioPlayer({ onToggleRightSidebar, isRightSidebarOpen }) {
  const { state, dispatch } = useMusic()
  const audioRef = useRef(null)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [audioLoaded, setAudioLoaded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [repeatMode, setRepeatMode] = useState('off') // 'off', 'one'
  const animationRef = useRef(null) // For manual time updates
  const modalRef = useRef(null)
  const volumeButtonRef = useRef(null)
  const isSeekingRef = useRef(false) // Track seeking state

  const { currentSong, isPlaying, volume, currentTime, duration } = state
  const isFavorite = currentSong && state.favorites.some((fav) => fav.id === currentSong.id)

  // Detect mobile screen size and dark mode
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640) // sm breakpoint
    }

    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }

    // Initial checks
    checkDarkMode()
    checkScreenSize()

    // Set up observers
    window.addEventListener('resize', checkScreenSize)

    // Watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => {
      window.removeEventListener('resize', checkScreenSize)
      observer.disconnect()
    }
  }, [])

  // Handle click outside volume dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on the modal itself or the volume button
      if (modalRef.current && !modalRef.current.contains(event.target) &&
          volumeButtonRef.current && !volumeButtonRef.current.contains(event.target)) {
        setShowVolumeSlider(false)
      }
    }

    if (showVolumeSlider) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [showVolumeSlider])

  // Reset state when song changes
  useEffect(() => {
    dispatch({ type: "SET_TIME", payload: 0 })
    dispatch({ type: "SET_DURATION", payload: 0 })
    setAudioLoaded(false)
    setIsDragging(false) // Reset dragging state
    isSeekingRef.current = false // Reset seeking state

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = currentSong.url
      audioRef.current.load()
      audioRef.current.currentTime = 0 // Ensure reset
    }

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [currentSong?.id, dispatch])

  // Manual time updates for problematic audio sources
  const updateTimeManually = () => {
    if (!audioRef.current || isDragging || isSeekingRef.current) return
    
    const currentAudioTime = audioRef.current.currentTime
    // Only update if there's a meaningful difference to avoid unnecessary re-renders
    if (Math.abs(currentAudioTime - currentTime) > 0.1) {
      dispatch({ type: "SET_TIME", payload: currentAudioTime })
    }
    
    if (isPlaying && !isDragging && !isSeekingRef.current) {
      animationRef.current = requestAnimationFrame(updateTimeManually)
    }
  }

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      // Only update time if we're not dragging or seeking
      if (!isDragging && !isSeekingRef.current) {
        dispatch({ type: "SET_TIME", payload: audio.currentTime })
      }
    }

    const handleLoadedData = () => {
      setAudioLoaded(true)
      if (audio.readyState >= 2) {
        const validDuration = audio.duration !== Infinity ? audio.duration : 0
        dispatch({ type: "SET_DURATION", payload: validDuration })
      }
    }

    const handleDurationChange = () => {
      if (audio.duration !== Infinity && !isNaN(audio.duration)) {
        dispatch({ type: "SET_DURATION", payload: audio.duration })
      }
    }

    const handleCanPlay = () => {
      setAudioLoaded(true)
      if (audio.duration !== Infinity && !isNaN(audio.duration)) {
        dispatch({ type: "SET_DURATION", payload: audio.duration })
      }
    }

    const handleError = (e) => {
      console.error("Audio error:", e)
      dispatch({ type: "SET_PLAYING", payload: false })
      setAudioLoaded(false)
    }

    const handleEnded = () => {
      if (repeatMode === 'one') {
        // Repeat the current song
        audio.currentTime = 0
        dispatch({ type: "SET_TIME", payload: 0 })
        audio.play().catch(e => console.error("Repeat playback error:", e))
      } else {
        // Normal behavior - stop playing
        dispatch({ type: "SET_PLAYING", payload: false })
        dispatch({ type: "SET_TIME", payload: 0 })
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }

    // Add seeking event handlers
    const handleSeeking = () => {
      isSeekingRef.current = true
    }

    const handleSeeked = () => {
      isSeekingRef.current = false
      // Update our state to match the actual audio time
      dispatch({ type: "SET_TIME", payload: audio.currentTime })
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadeddata", handleLoadedData)
    audio.addEventListener("durationchange", handleDurationChange)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)
    audio.addEventListener("seeking", handleSeeking)
    audio.addEventListener("seeked", handleSeeked)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadeddata", handleLoadedData)
      audio.removeEventListener("durationchange", handleDurationChange)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
      audio.removeEventListener("seeking", handleSeeking)
      audio.removeEventListener("seeked", handleSeeked)
    }
  }, [dispatch, isDragging, repeatMode])

  // Play/pause control
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return

    const playAudio = async () => {
      try {
        // Start manual time updates as fallback
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
        animationRef.current = requestAnimationFrame(updateTimeManually)

        // Ensure audio is properly loaded
        if (!audioLoaded) {
          audio.load()
          await new Promise(resolve => {
            const checkReady = () => {
              if (audio.readyState >= 3) { // HAVE_FUTURE_DATA
                resolve()
              } else {
                setTimeout(checkReady, 100)
              }
            }
            checkReady()
          })
        }

        await audio.play()

        // Refresh duration after playback starts
        if (audio.duration !== Infinity && !isNaN(audio.duration)) {
          dispatch({ type: "SET_DURATION", payload: audio.duration })
        }
      } catch (error) {
        console.error("Playback error:", error)
        dispatch({ type: "SET_PLAYING", payload: false })

        if (error.name === "NotSupportedError") {
          console.log("Retrying playback...")
          setTimeout(() => {
            audio.load()
            audio.play().catch(e => console.error("Retry failed:", e))
          }, 300)
        }
      }
    }

    if (isPlaying) {
      playAudio()
    } else {
      audio.pause()
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, currentSong, dispatch, audioLoaded])

  // Volume control
  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = volume
    }
  }, [volume])

  const handlePlayPause = () => {
    dispatch({ type: "TOGGLE_PLAY" })
  }

  const handleVolumeChange = (e) => {
    const newVolume = Number.parseFloat(e.target.value)
    dispatch({ type: "SET_VOLUME", payload: newVolume })
  }

  const toggleMute = () => {
    dispatch({ type: "SET_VOLUME", payload: volume > 0 ? 0 : 0.7 })
  }

  const handleVolumeClick = () => {
    if (isMobile) {
      setShowVolumeSlider(!showVolumeSlider)
    } else {
      toggleMute()
    }
  }

  const handleRepeat = () => {
    setRepeatMode(prev => prev === 'off' ? 'one' : 'off')
  }

  const handleFavorite = () => {
    if (!currentSong) return

    if (isFavorite) {
      dispatch({ type: "REMOVE_FROM_FAVORITES", payload: currentSong.id })
    } else {
      dispatch({ type: "ADD_TO_FAVORITES", payload: currentSong })
    }
  }

  // Fixed seek handlers
  const handleSeekStart = (e) => {
    setIsDragging(true)
    isSeekingRef.current = true
    
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  const handleSeekChange = (e) => {
    if (!duration) return
    
    const newTime = Number.parseFloat(e.target.value)
    // Clamp the value to valid range
    const clampedTime = Math.max(0, Math.min(newTime, duration))
    
    // Update UI immediately for responsiveness
    dispatch({ type: "SET_TIME", payload: clampedTime })
  }

  const handleSeekEnd = (e) => {
    if (!duration) return
    
    const newTime = Number.parseFloat(e.target.value)
    const clampedTime = Math.max(0, Math.min(newTime, duration))
    
    const audio = audioRef.current
    if (audio) {
      try {
        audio.currentTime = clampedTime
        dispatch({ type: "SET_TIME", payload: clampedTime })
      } catch (error) {
        console.error("Seek error:", error)
      }
    }
    
    // Reset dragging state
    setIsDragging(false)
    isSeekingRef.current = false
    
    // Restart manual updates if playing
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(updateTimeManually)
    }
  }

  // Handle touch events for mobile
  const handleTouchEnd = (e) => {
    handleSeekEnd(e)
  }

  const progressPercentage = duration && duration > 0 ?
    Math.max(0, Math.min(100, (currentTime / duration) * 100)) : 0

  if (!currentSong) {
    return null
  }

  return (
    <>
      <div className="bg-white/95 dark:bg-gray-800/95 border-t border-gray-200/50 dark:border-gray-700/50 px-6 py-2 backdrop-blur-lg shadow-2xl">
        <audio
          key={currentSong.id}
          ref={audioRef}
          src={currentSong.url}
          preload="auto"
        />

        <div className="flex items-center justify-between">
          {/* Song Info */}
          <div className="flex items-center space-x-3 w-50 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                src={currentSong.cover || "https://via.placeholder.com/48x48?text=Cover"}
                alt={currentSong.title}
                className="w-12 h-12 rounded-lg object-cover shadow-md"
              />
              {currentSong.isUploaded && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm truncate">{currentSong.title}</h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs truncate">{currentSong.artist}</p>
            </div>
            <button
              onClick={handleFavorite}
              className={`p-2 rounded-full transition-all duration-200 flex-shrink-0 ${isFavorite
                ? "text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20"
                : "text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center space-y-1 flex-1 max-w-md">
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200">
                <Shuffle className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200">
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={handlePlayPause}
                className="w-10 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200">
                <SkipForward className="w-5 h-5" />
              </button>
              <button 
                onClick={handleRepeat}
                className={`p-2 rounded-full transition-all duration-200 ${
                  repeatMode === 'one' 
                    ? "text-purple-500 hover:text-purple-600 bg-purple-50 dark:bg-purple-900/20" 
                    : "hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>

            {/* Seekbar */}
            <div className="flex items-center space-x-3 w-full">
              <span className="text-xs text-gray-500 font-mono w-10 text-left flex-shrink-0">
                {formatTime(currentTime)}
              </span>

              <div className="flex-1 relative">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime || 0}
                  onMouseDown={handleSeekStart}
                  onTouchStart={handleSeekStart}
                  onChange={handleSeekChange}
                  onMouseUp={handleSeekEnd}
                  onTouchEnd={handleTouchEnd}
                  className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer select-none"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${progressPercentage}%, ${isDarkMode ? "#374151" : "#e5e7eb"
                      } ${progressPercentage}%, ${isDarkMode ? "#374151" : "#e5e7eb"
                      } 100%)`,
                  }}
                />
              </div>

              <span className="text-xs text-gray-500 font-mono w-10 text-right flex-shrink-0">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-40  justify-end">
            {/* Volume Controls & Toggle Right Sidebar Button */}
            <div className="flex items-center space-x-2 justify-end relative">

              {/* Toggle Right Sidebar Button */}
              <button
                onClick={onToggleRightSidebar}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <PanelRightOpen className={`w-4 h-4 transition-transform duration-300 ${isRightSidebarOpen ? "rotate-180" : "rotate-0"
                  }`} />
              </button>

              {/* Volume Icon */}
              <button
                ref={volumeButtonRef}
                onClick={handleVolumeClick}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
              >
                {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Volume Slider - Hidden on mobile, shown in dropdown */}
              {!isMobile && (
                <div className="h-6 flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${volume * 100}%, ${isDarkMode ? "#374151" : "#e5e7eb"
                        } ${volume * 100}%, ${isDarkMode ? "#374151" : "#e5e7eb"} 100%)`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          
        </div>

      </div>

      {/* Volume Dropdown for Mobile - Single instance */}
      {showVolumeSlider && isMobile && (
        <div className="fixed bottom-20 right-3 z-50">
          <div
            ref={modalRef}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-48"
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
                onChange={handleVolumeChange}
                className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${volume * 100}%, ${isDarkMode ? "#374151" : "#e5e7eb"
                    } ${volume * 100}%, ${isDarkMode ? "#374151" : "#e5e7eb"} 100%)`,
                }}
              />

              <button
                onClick={toggleMute}
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