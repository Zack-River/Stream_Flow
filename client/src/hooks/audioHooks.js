import { useState, useRef, useEffect, useCallback } from 'react'

export const useAudioPlayer = (currentSong, volume, onTimeUpdate, onEnded, onError) => {
    const audioRef = useRef(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [isBuffering, setIsBuffering] = useState(false)
    const animationRef = useRef(null)
    const isSeekingRef = useRef(false)

    // Initialize audio element
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio()
            audioRef.current.preload = 'auto'
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [])

    // Handle audio events
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const handleLoadedData = () => {
            setIsLoaded(true)
            setIsBuffering(false)
            audio.volume = volume
        }

        const handleLoadStart = () => {
            setIsBuffering(true)
        }

        const handleTimeUpdate = () => {
            if (!isSeekingRef.current && onTimeUpdate) {
                onTimeUpdate(audio.currentTime, audio.duration)
            }
        }

        const handleEnded = () => {
            if (onEnded) onEnded()
        }

        const handleError = (e) => {
            console.error('Audio error:', e)
            setIsLoaded(false)
            setIsBuffering(false)
            if (onError) onError(e)
        }

        const handleSeeking = () => {
            isSeekingRef.current = true
        }

        const handleSeeked = () => {
            isSeekingRef.current = false
            if (onTimeUpdate) {
                onTimeUpdate(audio.currentTime, audio.duration)
            }
        }

        // Add all event listeners
        audio.addEventListener('loadeddata', handleLoadedData)
        audio.addEventListener('loadstart', handleLoadStart)
        audio.addEventListener('timeupdate', handleTimeUpdate)
        audio.addEventListener('ended', handleEnded)
        audio.addEventListener('error', handleError)
        audio.addEventListener('seeking', handleSeeking)
        audio.addEventListener('seeked', handleSeeked)

        return () => {
            audio.removeEventListener('loadeddata', handleLoadedData)
            audio.removeEventListener('loadstart', handleLoadStart)
            audio.removeEventListener('timeupdate', handleTimeUpdate)
            audio.removeEventListener('ended', handleEnded)
            audio.removeEventListener('error', handleError)
            audio.removeEventListener('seeking', handleSeeking)
            audio.removeEventListener('seeked', handleSeeked)
        }
    }, [volume, onTimeUpdate, onEnded, onError])

    // Load new song
    useEffect(() => {
        const audio = audioRef.current
        if (!audio || !currentSong) return

        const audioUrl = currentSong.url || currentSong.audioUrl
        if (audio.src !== audioUrl) {
            setIsLoaded(false)
            setIsBuffering(true)
            audio.src = audioUrl
            audio.load()
            audio.volume = volume
        }
    }, [currentSong, volume])

    // Control functions
    const play = useCallback(async () => {
        const audio = audioRef.current
        if (!audio || !isLoaded) return false

        try {
            audio.volume = volume
            await audio.play()
            return true
        } catch (error) {
            console.error('Play error:', error)
            if (onError) onError(error)
            return false
        }
    }, [isLoaded, volume, onError])

    const pause = useCallback(() => {
        const audio = audioRef.current
        if (!audio) return

        try {
            audio.pause()
        } catch (error) {
            console.error('Pause error:', error)
        }
    }, [])

    const seek = useCallback((time) => {
        const audio = audioRef.current
        if (!audio || !isLoaded) return

        try {
            audio.currentTime = Math.max(0, Math.min(time, audio.duration || 0))
        } catch (error) {
            console.error('Seek error:', error)
        }
    }, [isLoaded])

    const setVolume = useCallback((newVolume) => {
        const audio = audioRef.current
        if (!audio) return

        try {
            audio.volume = Math.max(0, Math.min(1, newVolume))
        } catch (error) {
            console.error('Volume error:', error)
        }
    }, [])

    return {
        play,
        pause,
        seek,
        setVolume,
        isLoaded,
        isBuffering,
        audioRef
    }
}

export const useAudioControls = (musicState, musicDispatch, audioPlayer) => {
    const { currentSong, isPlaying } = musicState

    const handlePlayPause = useCallback(async () => {
        if (!currentSong) return

        if (isPlaying) {
            audioPlayer.pause()
            musicDispatch({ type: 'SET_PLAYING', payload: false })
        } else {
            const success = await audioPlayer.play()
            if (success) {
                musicDispatch({ type: 'SET_PLAYING', payload: true })
            }
        }
    }, [currentSong, isPlaying, audioPlayer, musicDispatch])

    const handleSeek = useCallback((time) => {
        audioPlayer.seek(time)
        musicDispatch({ type: 'SET_TIME', payload: time })
    }, [audioPlayer, musicDispatch])

    const handleVolumeChange = useCallback((volume) => {
        audioPlayer.setVolume(volume)
        musicDispatch({ type: 'SET_VOLUME', payload: volume })
    }, [audioPlayer, musicDispatch])

    return {
        handlePlayPause,
        handleSeek,
        handleVolumeChange
    }
}

export const useVolumeControl = (initialVolume = 0.6) => {
    const [showVolumeSlider, setShowVolumeSlider] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const modalRef = useRef(null)
    const buttonRef = useRef(null)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640)
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                modalRef.current && !modalRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)
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

    return {
        showVolumeSlider,
        setShowVolumeSlider,
        isMobile,
        modalRef,
        buttonRef
    }
}

export const useSeekBar = (currentTime, duration, onSeek) => {
    const [isDragging, setIsDragging] = useState(false)
    const [dragValue, setDragValue] = useState(0)

    const progressPercentage = duration && duration > 0
        ? Math.max(0, Math.min(100, (currentTime / duration) * 100))
        : 0

    const handleSeekStart = useCallback((e) => {
        setIsDragging(true)
        const newTime = parseFloat(e.target.value)
        setDragValue(newTime)
    }, [])

    const handleSeekChange = useCallback((e) => {
        if (!isDragging) return
        const newTime = parseFloat(e.target.value)
        setDragValue(newTime)
    }, [isDragging])

    const handleSeekEnd = useCallback((e) => {
        if (!isDragging) return

        const newTime = parseFloat(e.target.value)
        const clampedTime = Math.max(0, Math.min(newTime, duration || 0))

        onSeek(clampedTime)
        setIsDragging(false)
        setDragValue(0)
    }, [isDragging, duration, onSeek])

    const displayTime = isDragging ? dragValue : currentTime

    return {
        isDragging,
        progressPercentage,
        displayTime,
        handleSeekStart,
        handleSeekChange,
        handleSeekEnd
    }
}