import React, { useCallback, useEffect } from 'react'
import { useMusic } from '../../context/MusicContext'
import { useAudioPlayer } from '../../hooks/audioHooks'
import { formatTime } from '../../utils/audioUtils'
import PlayerControls from './PlayerControls'
import SeekBar from './SeekBar'
import SongInfo from './SongInfo'
import VolumeControl from './VolumeControl'
import RightSidebarToggle from './RightSidebarToggle'

export default function AudioPlayer({ onToggleRightSidebar, isRightSidebarOpen }) {
  const { state, dispatch, playNext, playPrevious, toggleShuffle, toggleRepeat, hasNext, hasPrevious } = useMusic()
  const { currentSong, isPlaying, volume, currentTime, duration, isShuffled, repeatMode, isSkipping } = state

  // Handle audio events
  const handleTimeUpdate = useCallback((time, dur) => {
    dispatch({ type: 'SET_TIME', payload: time })
    if (dur && dur !== Infinity && !isNaN(dur)) {
      dispatch({ type: 'SET_DURATION', payload: dur })
    }
  }, [dispatch])

  const handleEnded = useCallback(() => {
    console.log('🎵 Audio ended in player')
    dispatch({ type: 'SET_SKIPPING', payload: false })
    
    if (repeatMode === 'one') {
      console.log('🔁 Repeating current song')
      dispatch({ type: 'SET_TIME', payload: 0 })
      setTimeout(() => {
        dispatch({ type: 'SET_PLAYING', payload: true })
      }, 50)
    } else if (hasNext()) {
      console.log('⏭️ Playing next song')
      setTimeout(() => playNext(), 100)
    } else {
      console.log('⏹️ No next song, stopping')
      dispatch({ type: 'SET_PLAYING', payload: false })
      dispatch({ type: 'SET_TIME', payload: 0 })
    }
  }, [dispatch, repeatMode, hasNext, playNext])

  const handleError = useCallback((error) => {
    console.error('🚫 Audio player error:', error)
    dispatch({ type: 'SET_PLAYING', payload: false })
  }, [dispatch])

  // Initialize audio player hook
  const audioPlayer = useAudioPlayer(currentSong, volume, handleTimeUpdate, handleEnded, handleError)

  // ENHANCED: Sync playing state with audio element
  useEffect(() => {
    const syncAudioState = async () => {
      if (!currentSong) {
        console.log('🎵 No current song, pausing audio')
        audioPlayer.pause()
        return
      }

      if (isPlaying) {
        console.log('🎵 State says playing, starting audio for:', currentSong.title)
        const success = await audioPlayer.play()
        if (!success) {
          console.error('🚫 Failed to start audio playback')
          dispatch({ type: 'SET_PLAYING', payload: false })
        }
      } else {
        console.log('🎵 State says paused, pausing audio')
        audioPlayer.pause()
      }
    }

    syncAudioState()
  }, [isPlaying, currentSong, audioPlayer, dispatch])

  // Audio controls
  const handlePlayPause = useCallback(async () => {
    if (!currentSong) {
      console.log('🚫 No current song to play')
      return
    }

    console.log('🎵 AudioPlayer play/pause clicked', { isPlaying, currentSong: currentSong.title })

    if (isPlaying) {
      audioPlayer.pause()
      dispatch({ type: 'SET_PLAYING', payload: false })
    } else {
      const success = await audioPlayer.play()
      if (success) {
        dispatch({ type: 'SET_PLAYING', payload: true })
      } else {
        console.error('🚫 Failed to play audio')
      }
    }
  }, [currentSong, isPlaying, audioPlayer, dispatch])

  const handleSeek = useCallback((time) => {
    console.log('⏭️ Seeking to:', time)
    audioPlayer.seek(time)
    dispatch({ type: 'SET_TIME', payload: time })
  }, [audioPlayer, dispatch])

  const handleVolumeChange = useCallback((newVolume) => {
    console.log('🔊 Volume change:', newVolume)
    audioPlayer.setVolume(newVolume)
    dispatch({ type: 'SET_VOLUME', payload: newVolume })
  }, [audioPlayer, dispatch])

  // Skip handlers
  const handleSkipNext = useCallback(() => {
    if (isSkipping || !hasNext()) return
    console.log('⏭️ Skipping to next song')
    audioPlayer.pause()
    playNext()
  }, [isSkipping, hasNext, audioPlayer, playNext])

  const handleSkipPrevious = useCallback(() => {
    if (isSkipping || !hasPrevious()) return
    console.log('⏮️ Skipping to previous song')
    audioPlayer.pause()
    playPrevious()
  }, [isSkipping, hasPrevious, audioPlayer, playPrevious])

  // Favorite handler
  const handleFavorite = useCallback(() => {
    if (!currentSong) return
    
    const currentSongId = currentSong.id || currentSong._id
    const isFavorite = state.favorites.some(fav => (fav.id || fav._id) === currentSongId)
    
    if (isFavorite) {
      dispatch({ type: 'REMOVE_FROM_FAVORITES', payload: currentSongId })
      console.log('💔 Removed from favorites:', currentSong.title)
    } else {
      dispatch({ type: 'ADD_TO_FAVORITES', payload: currentSong })
      console.log('❤️ Added to favorites:', currentSong.title)
    }
  }, [currentSong, state.favorites, dispatch])

  // Volume handlers
  const handleMute = useCallback(() => {
    const newVolume = volume > 0 ? 0 : 0.7
    handleVolumeChange(newVolume)
  }, [volume, handleVolumeChange])

  // Volume control state
  const [showVolumeSlider, setShowVolumeSlider] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const volumeButtonRef = React.useRef(null)
  const volumeModalRef = React.useRef(null)

  // Detect mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle volume dropdown clicks
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        volumeModalRef.current && !volumeModalRef.current.contains(event.target) &&
        volumeButtonRef.current && !volumeButtonRef.current.contains(event.target)
      ) {
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

  if (!currentSong) {
    return null
  }

  return (
    <>
      <div className="bg-white/95 dark:bg-gray-800/95 border-t border-gray-200/50 dark:border-gray-700/50 px-3 py-2 sm:px-4 lg:px-6 backdrop-blur-lg shadow-2xl w-full">
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          
          {/* Song Info + Favorite */}
          <SongInfo 
            currentSong={currentSong}
            isFavorite={state.favorites.some(fav => (fav.id || fav._id) === (currentSong.id || currentSong._id))}
            onFavorite={handleFavorite}
          />

          {/* Controls Section */}
          <div className="flex flex-col space-y-2 sm:space-y-1 flex-1 sm:max-w-md">
            <PlayerControls
              isPlaying={isPlaying}
              isShuffled={isShuffled}
              repeatMode={repeatMode}
              isSkipping={isSkipping}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              onPlayPause={handlePlayPause}
              onSkipNext={handleSkipNext}
              onSkipPrevious={handleSkipPrevious}
              onShuffle={toggleShuffle}
              onRepeat={toggleRepeat}
            />

            <SeekBar
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
              isSkipping={isSkipping}
            />
          </div>

          {/* Right Controls */}
          <div className="hidden sm:flex items-center space-x-2 w-32 lg:w-40 justify-end">
            <RightSidebarToggle
              isOpen={isRightSidebarOpen}
              onToggle={onToggleRightSidebar}
            />

            <VolumeControl
              volume={volume}
              isMobile={isMobile}
              showSlider={showVolumeSlider}
              onVolumeChange={handleVolumeChange}
              onMute={handleMute}
              onToggleSlider={() => setShowVolumeSlider(!showVolumeSlider)}
              refs={{
                button: volumeButtonRef,
                modal: volumeModalRef
              }}
            />
          </div>
        </div>
      </div>

      {/* Loading/Skipping Indicator */}
      {isSkipping && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-black/50 text-white px-4 py-2 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      )}
    </>
  )
}