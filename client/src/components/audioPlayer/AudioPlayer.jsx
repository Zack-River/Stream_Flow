import { useState, useRef, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Repeat1, Heart, PanelRightOpen } from "lucide-react"
import { useMusic } from "../../context/MusicContext"
import { formatTime, parseTime } from "../../utils/audioUtils"

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
  
  // Handle both song ID formats
  const currentSongId = currentSong?.id || currentSong?._id
  const isFavorite = currentSong && state.favorites.some((fav) => (fav.id || fav._id) === currentSongId)

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

    if (audioRef.current && currentSong) {
      audioRef.current.pause()
      // Handle both URL formats
      const audioUrl = currentSong.url || currentSong.audioUrl
      audioRef.current.src = audioUrl
      audioRef.current.load()
      audioRef.current.currentTime = 0 // Ensure reset
      
      // IMPORTANT: Apply volume immediately after loading new song
      audioRef.current.volume = volume
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
  }, [currentSongId, dispatch]) // Removed volume dependency to prevent restart

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
      // Apply volume when audio data is loaded
      audio.volume = volume
      
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
      // Apply volume when audio can play
      audio.volume = volume
      
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

    // Add volume change handler to ensure consistency
    const handleVolumeChange = () => {
      // Sync audio volume with our state if they get out of sync
      if (Math.abs(audio.volume - volume) > 0.01) {
        audio.volume = volume
      }
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadeddata", handleLoadedData)
    audio.addEventListener("durationchange", handleDurationChange)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)
    audio.addEventListener("seeking", handleSeeking)
    audio.addEventListener("seeked", handleSeeked)
    audio.addEventListener("volumechange", handleVolumeChange)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadeddata", handleLoadedData)
      audio.removeEventListener("durationchange", handleDurationChange)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
      audio.removeEventListener("seeking", handleSeeking)
      audio.removeEventListener("seeked", handleSeeked)
      audio.removeEventListener("volumechange", handleVolumeChange)
    }
  }, [dispatch, isDragging, repeatMode]) // Removed volume dependency to prevent restart

  // Play/pause control
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return

    const playAudio = async () => {
      try {
        // Ensure volume is set before playing
        audio.volume = volume

        // Start manual time updates as fallback
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
        animationRef.current = requestAnimationFrame(updateTimeManually)

        // Ensure audio is properly loaded
        if (!audioLoaded) {
          audio.load()
          // Apply volume after loading
          audio.volume = volume
          
          await new Promise(resolve => {
            const checkReady = () => {
              if (audio.readyState >= 3) { // HAVE_FUTURE_DATA
                // Ensure volume is still correct
                audio.volume = volume
                resolve()
              } else {
                setTimeout(checkReady, 100)
              }
            }
            checkReady()
          })
        }

        await audio.play()

        // Refresh duration after playback starts and ensure volume
        if (audio.duration !== Infinity && !isNaN(audio.duration)) {
          dispatch({ type: "SET_DURATION", payload: audio.duration })
        }
        
        // Final volume check
        audio.volume = volume
      } catch (error) {
        console.error("Playback error:", error)
        dispatch({ type: "SET_PLAYING", payload: false })

        if (error.name === "NotSupportedError") {
          console.log("Retrying playback...")
          setTimeout(() => {
            audio.load()
            audio.volume = volume // Apply volume before retry
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
  }, [isPlaying, currentSong, dispatch, audioLoaded]) // Removed volume dependency to prevent restart

  // Volume control - Enhanced to handle both user preference and immediate application
  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = volume
      
      // For extra safety, set a small delay for stubborn audio sources
      setTimeout(() => {
        if (audio.volume !== volume) {
          audio.volume = volume
        }
      }, 100)
    }
  }, [volume])

  const handlePlayPause = () => {
    dispatch({ type: "TOGGLE_PLAY" })
  }

  const handleVolumeChange = (e) => {
    const newVolume = Number.parseFloat(e.target.value)
    dispatch({ type: "SET_VOLUME", payload: newVolume })
    
    // Apply immediately to audio element
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const toggleMute = () => {
    const newVolume = volume > 0 ? 0 : 0.7
    dispatch({ type: "SET_VOLUME", payload: newVolume })
    
    // Apply immediately to audio element
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
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
      dispatch({ type: "REMOVE_FROM_FAVORITES", payload: currentSongId })
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

  // Get display values with proper fallbacks
  const displayTitle = currentSong.title || "Unknown Title"
  const displayArtist = currentSong.artist || currentSong.singer || "Unknown Artist"
  const displayCover = currentSong.cover || currentSong.coverImageUrl || "https://placehold.co/48x48/EFEFEF/AAAAAA?text=Cover"

  return (
    <>
      {/* MOBILE-FIRST RESPONSIVE DESIGN: Reduced padding from px-6 py-2 to px-3 py-2 on mobile, increased on larger screens */}
      <div className="bg-white/95 dark:bg-gray-800/95 border-t border-gray-200/50 dark:border-gray-700/50 px-3 py-2 sm:px-4 lg:px-6 backdrop-blur-lg shadow-2xl">
        <audio
          key={currentSongId}
          ref={audioRef}
          src={currentSong.url || currentSong.audioUrl}
          preload="auto"
        />

        {/* MOBILE-FIRST: Stack vertically on mobile, horizontal on larger screens */}
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          
          {/* MOBILE: Song Info + Heart moved to top row with reduced spacing */}
          <div className="flex items-center justify-between sm:justify-start sm:space-x-3 sm:w-50 sm:min-w-0">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <img
                  src={displayCover}
                  alt={displayTitle}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover shadow-md"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/48x48/EFEFEF/AAAAAA?text=Cover"
                  }}
                />
                {currentSong.isUploaded && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-xs sm:text-sm truncate" title={displayTitle}>{displayTitle}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs truncate" title={displayArtist}>{displayArtist}</p>
              </div>
            </div>
            
            {/* MOBILE: Heart button moved to right of song info */}
            <button
              onClick={handleFavorite}
              className={`p-2 rounded-full transition-all duration-200 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center ${isFavorite
                ? "text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20"
                : "text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* MOBILE: Controls section - full width on mobile */}
          <div className="flex flex-col space-y-2 sm:space-y-1 flex-1 sm:max-w-md">
            {/* MOBILE: Reduced spacing between control buttons and smaller icons on mobile */}
            <div className="flex items-center justify-center space-x-2 sm:space-x-4">
              <button className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center">
                <Shuffle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center">
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={handlePlayPause}
                className="w-10 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />}
              </button>
              <button className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center">
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button 
                onClick={handleRepeat}
                className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center ${
                  repeatMode === 'one' 
                    ? "text-purple-500 hover:text-purple-600 bg-purple-50 dark:bg-purple-900/20" 
                    : "hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Repeat className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>
            </div>

            {/* MOBILE: Seekbar with reduced spacing and smaller text */}
            <div className="flex items-center space-x-2 sm:space-x-3 w-full">
              <span className="text-xs text-gray-500 font-mono w-8 sm:w-10 text-left flex-shrink-0">
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

              <span className="text-xs text-gray-500 font-mono w-8 sm:w-10 text-right flex-shrink-0">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* MOBILE: Right controls - hidden on extra small screens, shown as minimal on small+ */}
          <div className="hidden sm:flex items-center space-x-2 w-32 lg:w-40 justify-end">
            <div className="flex items-center space-x-1 lg:space-x-2 justify-end relative">

              {/* Toggle Right Sidebar Button - hidden on mobile */}
              <button
                onClick={onToggleRightSidebar}
                className="hidden lg:block p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <PanelRightOpen className={`w-4 h-4 transition-transform duration-300 ${isRightSidebarOpen ? "rotate-180" : "rotate-0"
                  }`} />
              </button>

              {/* Volume Icon */}
              <button
                ref={volumeButtonRef}
                onClick={handleVolumeClick}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Volume Slider - Hidden on mobile and small screens */}
              {!isMobile && (
                <div className="hidden md:flex h-6 items-center">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-16 lg:w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
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

      {/* MOBILE: Volume Dropdown - positioned better for mobile screens */}
      {showVolumeSlider && isMobile && (
        <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-50">
          <div
            ref={modalRef}
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