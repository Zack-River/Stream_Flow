import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react'

// Action Types - Centralized for better maintenance
export const MUSIC_ACTIONS = {
  // Playback control
  SET_CURRENT_SONG: 'SET_CURRENT_SONG',
  SET_PLAYING: 'SET_PLAYING',
  TOGGLE_PLAY: 'TOGGLE_PLAY',
  SET_VOLUME: 'SET_VOLUME',
  SET_TIME: 'SET_TIME',
  SET_DURATION: 'SET_DURATION',
  SET_SKIPPING: 'SET_SKIPPING',

  // Queue management
  PLAY_SONG: 'PLAY_SONG',
  PLAY_NEXT: 'PLAY_NEXT',
  PLAY_PREVIOUS: 'PLAY_PREVIOUS',
  ADD_TO_QUEUE: 'ADD_TO_QUEUE',
  REMOVE_FROM_QUEUE: 'REMOVE_FROM_QUEUE',
  SET_QUEUE: 'SET_QUEUE',
  CLEAR_QUEUE: 'CLEAR_QUEUE',
  REORDER_QUEUE: 'REORDER_QUEUE',

  // Shuffle & Repeat
  TOGGLE_SHUFFLE: 'TOGGLE_SHUFFLE',
  SET_SHUFFLE: 'SET_SHUFFLE',
  TOGGLE_REPEAT: 'TOGGLE_REPEAT',
  SET_REPEAT_MODE: 'SET_REPEAT_MODE',

  // Favorites
  ADD_TO_FAVORITES: 'ADD_TO_FAVORITES',
  REMOVE_FROM_FAVORITES: 'REMOVE_FROM_FAVORITES',
  SET_FAVORITES: 'SET_FAVORITES',

  // Uploads
  ADD_UPLOAD: 'ADD_UPLOAD',
  REMOVE_UPLOAD: 'REMOVE_UPLOAD',
  UPDATE_UPLOAD: 'UPDATE_UPLOAD',
  SET_UPLOADS: 'SET_UPLOADS',

  // Playlists
  CREATE_PLAYLIST: 'CREATE_PLAYLIST',
  DELETE_PLAYLIST: 'DELETE_PLAYLIST',
  UPDATE_PLAYLIST: 'UPDATE_PLAYLIST',
  ADD_SONG_TO_PLAYLIST: 'ADD_SONG_TO_PLAYLIST',
  REMOVE_SONG_FROM_PLAYLIST: 'REMOVE_SONG_FROM_PLAYLIST',

  // State management
  LOAD_DATA: 'LOAD_DATA',
  RESET_STATE: 'RESET_STATE',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
}

// Initial state with better structure
const initialState = {
  // Playback state
  currentSong: null,
  isPlaying: false,
  volume: 0.6,
  currentTime: 0,
  duration: 0,
  isSkipping: false,

  // Queue state
  queue: [],
  queueIndex: -1,
  originalPlaylist: [],
  history: [],

  // Settings
  isShuffled: false,
  repeatMode: 'off', // 'off', 'all', 'one'

  // User data
  favorites: [],
  uploads: [],
  playlists: [
    {
      id: "playlist1",
      name: "My Favorites",
      description: "My favorite songs collection",
      songs: [],
      createdAt: Date.now()
    }
  ],

  // UI state
  error: null,
  isInitialized: false
}

// Utility functions
const createSongId = (song) => song.id || song._id
const normalizeSong = (song) => ({
  id: createSongId(song),
  title: song.title || 'Unknown Title',
  artist: song.artist || song.singer || 'Unknown Artist',
  album: song.album,
  duration: song.duration || '0:00',
  cover: song.cover || song.coverImageUrl,
  url: song.url || song.audioUrl,
  isUploaded: song.isUploaded || false,
  genre: song.genre,
  category: song.category,
  ...song // Include any additional properties
})

const shuffleArray = (array) => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

const findSongIndex = (queue, songId) => {
  return queue.findIndex(song => createSongId(song) === songId)
}

// Action creators for better consistency
export const createMusicAction = (type, payload) => ({ type, payload })

// Enhanced reducer with better error handling and state consistency
function musicReducer(state, action) {
  try {
    switch (action.type) {
      case MUSIC_ACTIONS.SET_CURRENT_SONG:
        return {
          ...state,
          currentSong: action.payload ? normalizeSong(action.payload) : null,
          error: null
        }

      case MUSIC_ACTIONS.TOGGLE_PLAY:
        return {
          ...state,
          isPlaying: !state.isPlaying,
          error: null
        }

      case MUSIC_ACTIONS.SET_PLAYING:
        return {
          ...state,
          isPlaying: Boolean(action.payload),
          error: null
        }

      case MUSIC_ACTIONS.SET_VOLUME:
        const newVolume = Math.max(0, Math.min(1, Number(action.payload) || 0))
        return {
          ...state,
          volume: newVolume,
          error: null
        }

      case MUSIC_ACTIONS.SET_TIME:
        const newTime = Math.max(0, Number(action.payload) || 0)
        return {
          ...state,
          currentTime: newTime,
          error: null
        }

      case MUSIC_ACTIONS.SET_DURATION:
        const newDuration = Number(action.payload)
        if (newDuration && newDuration !== Infinity && !isNaN(newDuration)) {
          return {
            ...state,
            duration: newDuration,
            error: null
          }
        }
        return state

      case MUSIC_ACTIONS.SET_SKIPPING:
        return {
          ...state,
          isSkipping: Boolean(action.payload),
          error: null
        }

      case MUSIC_ACTIONS.PLAY_SONG: {
        const { song, playlist = [], shouldShuffle = false } = action.payload
        if (!song) return { ...state, error: 'No song provided' }

        const normalizedSong = normalizeSong(song)
        const currentSongId = createSongId(normalizedSong)

        // Create queue from playlist or single song
        let newQueue = playlist.length > 0 ? playlist.map(normalizeSong) : [normalizedSong]
        const newOriginalPlaylist = [...newQueue]

        // Apply shuffle if requested or already on
        const shouldApplyShuffle = shouldShuffle || state.isShuffled
        if (shouldApplyShuffle && newQueue.length > 1) {
          const currentSongIndex = findSongIndex(newQueue, currentSongId)
          if (currentSongIndex > -1) {
            // Remove current song before shuffling
            const songToPlay = newQueue.splice(currentSongIndex, 1)[0]

            // Create extended shuffled queue for endless play
            const shuffledSongs = []
            const songsPool = [...newQueue]

            // Generate multiple rounds for endless shuffle
            for (let round = 0; round < 10; round++) {
              shuffledSongs.push(...shuffleArray([...songsPool]))
            }

            newQueue = [songToPlay, ...shuffledSongs]
          } else {
            // Shuffle entire queue
            const shuffledSongs = []
            for (let round = 0; round < 10; round++) {
              shuffledSongs.push(...shuffleArray([...newQueue]))
            }
            newQueue = shuffledSongs
          }
        }

        const queueIndex = findSongIndex(newQueue, currentSongId)

        return {
          ...state,
          currentSong: normalizedSong,
          queue: newQueue,
          originalPlaylist: newOriginalPlaylist,
          queueIndex: queueIndex >= 0 ? queueIndex : 0,
          isShuffled: shouldApplyShuffle,
          isPlaying: true,
          currentTime: 0,
          duration: 0,
          isSkipping: false,
          error: null,
          // Add to history if it's a different song
          history: state.currentSong && createSongId(state.currentSong) !== currentSongId
            ? [state.currentSong, ...state.history.slice(0, 49)]
            : state.history
        }
      }

      case MUSIC_ACTIONS.PLAY_NEXT: {
        if (state.queue.length === 0 || state.queueIndex === -1) {
          return { ...state, isSkipping: false, error: 'No songs in queue' }
        }

        const nextIndex = state.queueIndex + 1
        const hasNext = nextIndex < state.queue.length

        if (hasNext) {
          const nextSong = state.queue[nextIndex]
          return {
            ...state,
            currentSong: normalizeSong(nextSong),
            queueIndex: nextIndex,
            currentTime: 0,
            duration: 0,
            isPlaying: true,
            isSkipping: false,
            error: null,
            history: state.currentSong
              ? [state.currentSong, ...state.history.slice(0, 49)]
              : state.history
          }
        }

        // Handle repeat all
        if (state.repeatMode === 'all' && state.queue.length > 0) {
          const firstSong = state.queue[0]
          return {
            ...state,
            currentSong: normalizeSong(firstSong),
            queueIndex: 0,
            currentTime: 0,
            duration: 0,
            isPlaying: true,
            isSkipping: false,
            error: null,
            history: state.currentSong
              ? [state.currentSong, ...state.history.slice(0, 49)]
              : state.history
          }
        }

        return {
          ...state,
          isSkipping: false,
          error: 'No next song available'
        }
      }

      case MUSIC_ACTIONS.PLAY_PREVIOUS: {
        if (state.queue.length === 0 || state.queueIndex === -1) {
          return { ...state, isSkipping: false, error: 'No songs in queue' }
        }

        // If more than 3 seconds into song, restart current song
        if (state.currentTime > 3) {
          return {
            ...state,
            currentTime: 0,
            isSkipping: false,
            error: null
          }
        }

        const prevIndex = state.queueIndex - 1
        const hasPrev = prevIndex >= 0

        if (hasPrev) {
          const prevSong = state.queue[prevIndex]
          return {
            ...state,
            currentSong: normalizeSong(prevSong),
            queueIndex: prevIndex,
            currentTime: 0,
            duration: 0,
            isPlaying: true,
            isSkipping: false,
            error: null
          }
        }

        // Handle repeat all
        if (state.repeatMode === 'all' && state.queue.length > 0) {
          const lastIndex = state.queue.length - 1
          const lastSong = state.queue[lastIndex]
          return {
            ...state,
            currentSong: normalizeSong(lastSong),
            queueIndex: lastIndex,
            currentTime: 0,
            duration: 0,
            isPlaying: true,
            isSkipping: false,
            error: null
          }
        }

        return {
          ...state,
          isSkipping: false,
          error: 'No previous song available'
        }
      }

      case MUSIC_ACTIONS.TOGGLE_SHUFFLE: {
        if (state.queue.length === 0) return state

        const currentSongId = state.currentSong ? createSongId(state.currentSong) : null
        let newQueue, newIsShuffled

        if (state.isShuffled) {
          // Turn off shuffle - restore original order
          newQueue = [...state.originalPlaylist]
          newIsShuffled = false
        } else {
          // Turn on shuffle
          const currentSongIndex = currentSongId ? findSongIndex(state.queue, currentSongId) : -1
          let queueToShuffle = [...state.originalPlaylist]

          if (currentSongIndex > -1) {
            // Remove current song before shuffling
            const currentSong = queueToShuffle.splice(findSongIndex(queueToShuffle, currentSongId), 1)[0]

            // Create extended shuffled queue
            const shuffledSongs = []
            const songsPool = [...queueToShuffle]

            for (let round = 0; round < 10; round++) {
              shuffledSongs.push(...shuffleArray([...songsPool]))
            }

            newQueue = [currentSong, ...shuffledSongs]
          } else {
            // Shuffle entire queue
            const shuffledSongs = []
            for (let round = 0; round < 10; round++) {
              shuffledSongs.push(...shuffleArray([...queueToShuffle]))
            }
            newQueue = shuffledSongs
          }
          newIsShuffled = true
        }

        const newQueueIndex = currentSongId ? findSongIndex(newQueue, currentSongId) : 0

        return {
          ...state,
          queue: newQueue,
          queueIndex: newQueueIndex >= 0 ? newQueueIndex : 0,
          isShuffled: newIsShuffled,
          error: null
        }
      }

      case MUSIC_ACTIONS.TOGGLE_REPEAT: {
        let newRepeatMode
        switch (state.repeatMode) {
          case 'off':
            newRepeatMode = 'all'
            break
          case 'all':
            newRepeatMode = 'one'
            break
          case 'one':
            newRepeatMode = 'off'
            break
          default:
            newRepeatMode = 'off'
        }

        return {
          ...state,
          repeatMode: newRepeatMode,
          error: null
        }
      }

      case MUSIC_ACTIONS.SET_REPEAT_MODE: {
        const validModes = ['off', 'all', 'one']
        const newMode = validModes.includes(action.payload) ? action.payload : 'off'
        return {
          ...state,
          repeatMode: newMode,
          error: null
        }
      }

      case MUSIC_ACTIONS.ADD_TO_QUEUE: {
        const songToAdd = action.payload
        if (!songToAdd) return { ...state, error: 'No song provided' }

        const normalizedSongToAdd = normalizeSong(songToAdd)
        const songId = createSongId(normalizedSongToAdd)

        // Don't add if already in queue
        if (findSongIndex(state.queue, songId) > -1) {
          return { ...state, error: 'Song already in queue' }
        }

        return {
          ...state,
          queue: [...state.queue, normalizedSongToAdd],
          error: null
        }
      }

      case MUSIC_ACTIONS.REMOVE_FROM_QUEUE: {
        const indexToRemove = action.payload
        if (indexToRemove < 0 || indexToRemove >= state.queue.length) {
          return { ...state, error: 'Invalid queue index' }
        }

        const newQueue = [...state.queue]
        newQueue.splice(indexToRemove, 1)

        let newQueueIndex = state.queueIndex

        // Adjust current index if needed
        if (indexToRemove < state.queueIndex) {
          newQueueIndex = state.queueIndex - 1
        } else if (indexToRemove === state.queueIndex) {
          // Current song was removed
          if (newQueue.length === 0) {
            return {
              ...state,
              queue: [],
              currentSong: null,
              queueIndex: -1,
              isPlaying: false,
              error: null
            }
          }
          // Adjust index if we're at the end
          if (newQueueIndex >= newQueue.length) {
            newQueueIndex = newQueue.length - 1
          }
        }

        return {
          ...state,
          queue: newQueue,
          queueIndex: newQueueIndex,
          error: null
        }
      }

      case MUSIC_ACTIONS.SET_QUEUE:
        return {
          ...state,
          queue: Array.isArray(action.payload) ? action.payload.map(normalizeSong) : [],
          error: null
        }

      case MUSIC_ACTIONS.CLEAR_QUEUE:
        return {
          ...state,
          queue: [],
          originalPlaylist: [],
          queueIndex: -1,
          currentSong: null,
          isPlaying: false,
          isShuffled: false,
          error: null
        }

      case MUSIC_ACTIONS.ADD_TO_FAVORITES: {
        const songToAdd = action.payload
        if (!songToAdd) return { ...state, error: 'No song provided' }

        const normalizedSongToAdd = normalizeSong(songToAdd)
        const songId = createSongId(normalizedSongToAdd)

        // Don't add if already in favorites
        if (state.favorites.some(fav => createSongId(fav) === songId)) {
          return { ...state, error: 'Song already in favorites' }
        }

        return {
          ...state,
          favorites: [...state.favorites, normalizedSongToAdd],
          error: null
        }
      }

      case MUSIC_ACTIONS.REMOVE_FROM_FAVORITES:
        return {
          ...state,
          favorites: state.favorites.filter(song => createSongId(song) !== action.payload),
          error: null
        }

      case MUSIC_ACTIONS.SET_FAVORITES:
        return {
          ...state,
          favorites: Array.isArray(action.payload) ? action.payload.map(normalizeSong) : [],
          error: null
        }

      case MUSIC_ACTIONS.ADD_UPLOAD: {
        const songToAdd = action.payload
        if (!songToAdd) return { ...state, error: 'No song provided' }

        const normalizedSongToAdd = normalizeSong({ ...songToAdd, isUploaded: true })
        return {
          ...state,
          uploads: [...state.uploads, normalizedSongToAdd],
          error: null
        }
      }

      case MUSIC_ACTIONS.REMOVE_UPLOAD:
        return {
          ...state,
          uploads: state.uploads.filter(song => createSongId(song) !== action.payload),
          error: null
        }

      case MUSIC_ACTIONS.UPDATE_UPLOAD: {
        const { id, updates } = action.payload
        return {
          ...state,
          uploads: state.uploads.map(song =>
            createSongId(song) === id
              ? normalizeSong({ ...song, ...updates })
              : song
          ),
          error: null
        }
      }

      case MUSIC_ACTIONS.SET_UPLOADS:
        return {
          ...state,
          uploads: Array.isArray(action.payload) ? action.payload.map(song => normalizeSong({ ...song, isUploaded: true })) : [],
          error: null
        }

      case MUSIC_ACTIONS.CREATE_PLAYLIST: {
        const { name, description = "" } = action.payload
        if (!name) return { ...state, error: 'Playlist name required' }

        const newPlaylist = {
          id: `playlist_${Date.now()}`,
          name,
          description,
          songs: [],
          createdAt: Date.now()
        }

        return {
          ...state,
          playlists: [...state.playlists, newPlaylist],
          error: null
        }
      }

      case MUSIC_ACTIONS.DELETE_PLAYLIST:
        return {
          ...state,
          playlists: state.playlists.filter(playlist => playlist.id !== action.payload),
          error: null
        }

      case MUSIC_ACTIONS.UPDATE_PLAYLIST: {
        const { id, updates } = action.payload
        return {
          ...state,
          playlists: state.playlists.map(playlist =>
            playlist.id === id ? { ...playlist, ...updates } : playlist
          ),
          error: null
        }
      }

      case MUSIC_ACTIONS.ADD_SONG_TO_PLAYLIST: {
        const { playlistId, song } = action.payload
        if (!song) return { ...state, error: 'No song provided' }

        const normalizedSongToAdd = normalizeSong(song)

        return {
          ...state,
          playlists: state.playlists.map(playlist =>
            playlist.id === playlistId
              ? {
                ...playlist,
                songs: [...playlist.songs, normalizedSongToAdd],
                updatedAt: Date.now()
              }
              : playlist
          ),
          error: null
        }
      }

      case MUSIC_ACTIONS.REMOVE_SONG_FROM_PLAYLIST: {
        const { playlistId, songId } = action.payload
        return {
          ...state,
          playlists: state.playlists.map(playlist =>
            playlist.id === playlistId
              ? {
                ...playlist,
                songs: playlist.songs.filter(song => createSongId(song) !== songId),
                updatedAt: Date.now()
              }
              : playlist
          ),
          error: null
        }
      }

      case MUSIC_ACTIONS.LOAD_DATA: {
        const data = action.payload
        return {
          ...state,
          favorites: Array.isArray(data.favorites) ? data.favorites.map(normalizeSong) : state.favorites,
          uploads: Array.isArray(data.uploads) ? data.uploads.map(song => normalizeSong({ ...song, isUploaded: true })) : state.uploads,
          playlists: Array.isArray(data.playlists) ? data.playlists : state.playlists,
          volume: typeof data.volume === 'number' ? Math.max(0, Math.min(1, data.volume)) : state.volume,
          repeatMode: ['off', 'all', 'one'].includes(data.repeatMode) ? data.repeatMode : state.repeatMode,
          isInitialized: true,
          error: null
        }
      }

      case MUSIC_ACTIONS.SET_ERROR:
        return {
          ...state,
          error: action.payload
        }

      case MUSIC_ACTIONS.CLEAR_ERROR:
        return {
          ...state,
          error: null
        }

      case MUSIC_ACTIONS.RESET_STATE:
        return {
          ...initialState,
          isInitialized: true
        }

      default:
        console.warn(`Unknown action type: ${action.type}`)
        return state
    }
  } catch (error) {
    console.error('Music reducer error:', error)
    return {
      ...state,
      error: `Reducer error: ${error.message}`
    }
  }
}

// Context
const MusicContext = createContext()

// Enhanced provider with better patterns
export function MusicProvider({ children }) {
  const [state, dispatch] = useReducer(musicReducer, initialState)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("musicAppData")
      if (savedData) {
        const parsed = JSON.parse(savedData)
        dispatch(createMusicAction(MUSIC_ACTIONS.LOAD_DATA, parsed))
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
      dispatch(createMusicAction(MUSIC_ACTIONS.SET_ERROR, "Failed to load saved data"))
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // Save data to localStorage when state changes
  useEffect(() => {
    if (!isInitialized) return

    try {
      const dataToSave = {
        favorites: state.favorites,
        uploads: state.uploads,
        playlists: state.playlists,
        volume: state.volume,
        repeatMode: state.repeatMode,
      }
      localStorage.setItem("musicAppData", JSON.stringify(dataToSave))
    } catch (error) {
      console.error("Error saving data to localStorage:", error)
      dispatch(createMusicAction(MUSIC_ACTIONS.SET_ERROR, "Failed to save data"))
    }
  }, [state.favorites, state.uploads, state.playlists, state.volume, state.repeatMode, isInitialized])

  // Action creators with error handling
  const playSong = useCallback((song, playlist = [], shouldShuffle = false) => {
    try {
      dispatch(createMusicAction(MUSIC_ACTIONS.PLAY_SONG, { song, playlist, shouldShuffle }))
    } catch (error) {
      console.error('Play song error:', error)
      dispatch(createMusicAction(MUSIC_ACTIONS.SET_ERROR, "Failed to play song"))
    }
  }, [])

  const playNext = useCallback(() => {
    if (state.isSkipping) return
    dispatch(createMusicAction(MUSIC_ACTIONS.SET_SKIPPING, true))
    dispatch(createMusicAction(MUSIC_ACTIONS.PLAY_NEXT))
  }, [state.isSkipping])

  const playPrevious = useCallback(() => {
    if (state.isSkipping) return
    dispatch(createMusicAction(MUSIC_ACTIONS.SET_SKIPPING, true))
    dispatch(createMusicAction(MUSIC_ACTIONS.PLAY_PREVIOUS))
  }, [state.isSkipping])

  const toggleShuffle = useCallback(() => {
    dispatch(createMusicAction(MUSIC_ACTIONS.TOGGLE_SHUFFLE))
  }, [])

  const toggleRepeat = useCallback(() => {
    dispatch(createMusicAction(MUSIC_ACTIONS.TOGGLE_REPEAT))
  }, [])

  const setRepeatMode = useCallback((mode) => {
    dispatch(createMusicAction(MUSIC_ACTIONS.SET_REPEAT_MODE, mode))
  }, [])

  const addToQueue = useCallback((song) => {
    dispatch(createMusicAction(MUSIC_ACTIONS.ADD_TO_QUEUE, song))
  }, [])

  const removeFromQueue = useCallback((index) => {
    dispatch(createMusicAction(MUSIC_ACTIONS.REMOVE_FROM_QUEUE, index))
  }, [])

  const clearQueue = useCallback(() => {
    dispatch(createMusicAction(MUSIC_ACTIONS.CLEAR_QUEUE))
  }, [])

  // Helper functions
  const hasNext = useCallback(() => {
    if (state.queue.length === 0 || state.queueIndex === -1) return false
    return state.queueIndex < state.queue.length - 1 || state.repeatMode === 'all'
  }, [state.queue.length, state.queueIndex, state.repeatMode])

  const hasPrevious = useCallback(() => {
    if (state.queue.length === 0 || state.queueIndex === -1) return false
    return state.queueIndex > 0 || state.repeatMode === 'all' || state.currentTime > 3
  }, [state.queue.length, state.queueIndex, state.repeatMode, state.currentTime])

  const getNextSong = useCallback(() => {
    if (state.queue.length === 0 || state.queueIndex === -1) return null

    const nextIndex = state.queueIndex + 1
    if (nextIndex < state.queue.length) {
      return state.queue[nextIndex]
    }

    if (state.repeatMode === 'all' && state.queue.length > 0) {
      return state.queue[0]
    }

    return null
  }, [state.queue, state.queueIndex, state.repeatMode])

  const getPreviousSong = useCallback(() => {
    if (state.queue.length === 0 || state.queueIndex === -1) return null

    if (state.currentTime > 3) {
      return state.currentSong
    }

    const prevIndex = state.queueIndex - 1
    if (prevIndex >= 0) {
      return state.queue[prevIndex]
    }

    if (state.repeatMode === 'all' && state.queue.length > 0) {
      return state.queue[state.queue.length - 1]
    }

    return null
  }, [state.queue, state.queueIndex, state.repeatMode, state.currentTime, state.currentSong])

  // Playlist functions
  const createPlaylist = useCallback((name, description = "") => {
    dispatch(createMusicAction(MUSIC_ACTIONS.CREATE_PLAYLIST, { name, description }))
  }, [])

  const deletePlaylist = useCallback((playlistId) => {
    dispatch(createMusicAction(MUSIC_ACTIONS.DELETE_PLAYLIST, playlistId))
  }, [])

  const updatePlaylist = useCallback((playlistId, updates) => {
    dispatch(createMusicAction(MUSIC_ACTIONS.UPDATE_PLAYLIST, { id: playlistId, updates }))
  }, [])

  const addSongToPlaylist = useCallback((playlistId, song) => {
    dispatch(createMusicAction(MUSIC_ACTIONS.ADD_SONG_TO_PLAYLIST, { playlistId, song }))
  }, [])

  const removeSongFromPlaylist = useCallback((playlistId, songId) => {
    dispatch(createMusicAction(MUSIC_ACTIONS.REMOVE_SONG_FROM_PLAYLIST, { playlistId, songId }))
  }, [])

  // Error handling
  const clearError = useCallback(() => {
    dispatch(createMusicAction(MUSIC_ACTIONS.CLEAR_ERROR))
  }, [])

  const contextValue = {
    state,
    dispatch: useCallback((action) => {
      // Validate action structure
      if (!action || typeof action !== 'object' || !action.type) {
        console.error('Invalid action:', action)
        return
      }
      dispatch(action)
    }, []),

    // Enhanced playback controls
    playSong,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleRepeat,
    setRepeatMode,

    // Queue management
    addToQueue,
    removeFromQueue,
    clearQueue,

    // Helper functions
    hasNext,
    hasPrevious,
    getNextSong,
    getPreviousSong,

    // Playlist functions
    createPlaylist,
    deletePlaylist,
    updatePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,

    // Error handling
    clearError,

    // Action creators for external use
    MUSIC_ACTIONS,
    createMusicAction
  }

  return <MusicContext.Provider value={contextValue}>{children}</MusicContext.Provider>
}

export const useMusic = () => {
  const context = useContext(MusicContext)
  if (!context) {
    throw new Error("useMusic must be used within MusicProvider")
  }
  return context
}