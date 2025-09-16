import { createContext, useContext, useReducer, useEffect, useState } from "react"

const MusicContext = createContext()

const initialState = {
  currentSong: null,
  isPlaying: false,
  volume: 0.6,
  currentTime: 0,
  duration: 0,
  playlist: [],
  queue: [], // Current queue of songs
  originalPlaylist: [], // Original playlist before shuffle
  queueIndex: -1, // Current position in queue
  favorites: [],
  uploads: [],
  playlists: [
    {
      id: "playlist1",
      name: "My Favorites",
      description: "My favorite songs collection",
      songs: []
    },
    {
      id: "playlist2",
      name: "Chill Vibes",
      description: "Relaxing music for chill moments",
      songs: []
    },
    {
      id: "playlist3",
      name: "Workout Mix",
      description: "High energy songs for workouts",
      songs: []
    },
  ],
  isShuffled: false,
  repeatMode: 'off', // 'off', 'all', 'one'
  isRepeating: false, // Deprecated - kept for backward compatibility
  history: [], // Song history for better navigation
  isSkipping: false, // Prevent multiple skip operations
}

// Utility function to shuffle array
const shuffleArray = (array) => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// Utility function to find song in queue by ID (handles both id and _id)
const findSongIndex = (queue, songId) => {
  return queue.findIndex(song => (song.id || song._id) === songId)
}

function musicReducer(state, action) {
  switch (action.type) {
    case "SET_CURRENT_SONG":
      return { ...state, currentSong: action.payload }
    
    case "TOGGLE_PLAY":
      return { ...state, isPlaying: !state.isPlaying }
    
    case "SET_PLAYING":
      return { ...state, isPlaying: action.payload }
    
    case "SET_VOLUME":
      return { ...state, volume: action.payload }
    
    case "SET_TIME":
      return { ...state, currentTime: action.payload }
    
    case "SET_DURATION":
      return { ...state, duration: action.payload }

    case "SET_SKIPPING":
      return { ...state, isSkipping: action.payload }

    case "PLAY_SONG":
      const { song, playlist = [], startIndex = 0, shouldShuffle = false } = action.payload
      const currentSongId = song.id || song._id
      
      // Create queue from playlist or use single song
      let newQueue = playlist.length > 0 ? [...playlist] : [song]
      let newOriginalPlaylist = [...newQueue]
      
      // Apply shuffle if requested or if shuffle is already on
      const shouldApplyShuffle = shouldShuffle || state.isShuffled
      if (shouldApplyShuffle) {
        const currentSongIndex = findSongIndex(newQueue, currentSongId)
        if (currentSongIndex > -1) {
          // Remove current song from array before shuffling
          const songToPlay = newQueue.splice(currentSongIndex, 1)[0]
          
          // Create endless shuffled queue
          const shuffledSongs = []
          const songsPool = [...newQueue]
          
          // Generate multiple rounds of shuffled songs
          for (let round = 0; round < 10; round++) {
            const roundShuffle = shuffleArray([...songsPool])
            shuffledSongs.push(...roundShuffle)
          }
          
          // Put current song at the beginning
          newQueue = [songToPlay, ...shuffledSongs]
        } else {
          // Create endless shuffle
          const shuffledSongs = []
          const songsPool = [...newQueue]
          for (let round = 0; round < 10; round++) {
            const roundShuffle = shuffleArray([...songsPool])
            shuffledSongs.push(...roundShuffle)
          }
          newQueue = shuffledSongs
        }
      }
      
      // Find the index of the current song in the new queue
      const queueIndex = findSongIndex(newQueue, currentSongId)
      
      return {
        ...state,
        currentSong: song,
        queue: newQueue,
        originalPlaylist: newOriginalPlaylist,
        queueIndex: queueIndex >= 0 ? queueIndex : 0,
        playlist: playlist,
        isShuffled: shouldApplyShuffle,
        isPlaying: true,
        currentTime: 0,
        duration: 0,
        isSkipping: false,
        // Add to history if it's a different song
        history: state.currentSong && (state.currentSong.id || state.currentSong._id) !== currentSongId 
          ? [state.currentSong, ...state.history.slice(0, 49)] // Keep last 50 songs
          : state.history
      }

    case "PLAY_NEXT":
      if (state.queue.length === 0 || state.queueIndex === -1) return { ...state, isSkipping: false }
      
      const nextIndex = state.queueIndex + 1
      const hasNext = nextIndex < state.queue.length
      
      if (hasNext) {
        const nextSong = state.queue[nextIndex]
        return {
          ...state,
          currentSong: nextSong,
          queueIndex: nextIndex,
          currentTime: 0,
          duration: 0,
          isPlaying: true, // Ensure playing state is true
          isSkipping: false,
          history: state.currentSong 
            ? [state.currentSong, ...state.history.slice(0, 49)]
            : state.history
        }
      }
      
      // If no next song and repeat all is on, go to beginning
      if (state.repeatMode === 'all' && state.queue.length > 0) {
        const firstSong = state.queue[0]
        return {
          ...state,
          currentSong: firstSong,
          queueIndex: 0,
          currentTime: 0,
          duration: 0,
          isPlaying: true, // Ensure playing state is true
          isSkipping: false,
          history: state.currentSong 
            ? [state.currentSong, ...state.history.slice(0, 49)]
            : state.history
        }
      }
      
      return { ...state, isSkipping: false }

    case "PLAY_PREVIOUS":
      if (state.queue.length === 0 || state.queueIndex === -1) return { ...state, isSkipping: false }
      
      // If we're more than 3 seconds into the song, restart current song
      if (state.currentTime > 3) {
        return {
          ...state,
          currentTime: 0,
          isSkipping: false
        }
      }
      
      const prevIndex = state.queueIndex - 1
      const hasPrev = prevIndex >= 0
      
      if (hasPrev) {
        const prevSong = state.queue[prevIndex]
        return {
          ...state,
          currentSong: prevSong,
          queueIndex: prevIndex,
          currentTime: 0,
          duration: 0,
          isPlaying: true, // Ensure playing state is true
          isSkipping: false
        }
      }
      
      // If no previous song and repeat all is on, go to end
      if (state.repeatMode === 'all' && state.queue.length > 0) {
        const lastIndex = state.queue.length - 1
        const lastSong = state.queue[lastIndex]
        return {
          ...state,
          currentSong: lastSong,
          queueIndex: lastIndex,
          currentTime: 0,
          duration: 0,
          isPlaying: true, // Ensure playing state is true
          isSkipping: false
        }
      }
      
      return { ...state, isSkipping: false }

    case "TOGGLE_SHUFFLE":
      if (state.queue.length === 0) return state
      
      const shuffleCurrentSongId = state.currentSong?.id || state.currentSong?._id
      let newQueueForShuffle, newIsShuffled
      
      if (state.isShuffled) {
        // Turn off shuffle - restore original order
        newQueueForShuffle = [...state.originalPlaylist]
        newIsShuffled = false
      } else {
        // Turn on shuffle - create endless shuffled queue
        const currentSongIndex = findSongIndex(state.queue, shuffleCurrentSongId)
        let queueToShuffle = [...state.originalPlaylist] // Use original playlist for endless shuffle
        
        if (currentSongIndex > -1) {
          // Remove current song before shuffling
          const currentSong = queueToShuffle.splice(findSongIndex(queueToShuffle, shuffleCurrentSongId), 1)[0]
          
          // Create a much longer shuffled queue for endless play
          const shuffledSongs = []
          const songsPool = [...queueToShuffle]
          
          // Generate multiple rounds of shuffled songs (e.g., 10 rounds)
          for (let round = 0; round < 10; round++) {
            const roundShuffle = shuffleArray([...songsPool])
            shuffledSongs.push(...roundShuffle)
          }
          
          // Put current song at the beginning
          newQueueForShuffle = [currentSong, ...shuffledSongs]
        } else {
          // Create endless shuffle without current song
          const shuffledSongs = []
          for (let round = 0; round < 10; round++) {
            const roundShuffle = shuffleArray([...queueToShuffle])
            shuffledSongs.push(...roundShuffle)
          }
          newQueueForShuffle = shuffledSongs
        }
        newIsShuffled = true
      }
      
      // Find new index of current song
      const newQueueIndex = findSongIndex(newQueueForShuffle, shuffleCurrentSongId)
      
      return {
        ...state,
        queue: newQueueForShuffle,
        queueIndex: newQueueIndex >= 0 ? newQueueIndex : 0,
        isShuffled: newIsShuffled
      }

    case "TOGGLE_REPEAT":
      // Cycle through repeat modes: off -> all -> one -> off
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
        isRepeating: newRepeatMode !== 'off' // Update for backward compatibility
      }

    case "SET_REPEAT_MODE":
      return { 
        ...state, 
        repeatMode: action.payload,
        isRepeating: action.payload !== 'off' // Update for backward compatibility
      }

    case "ADD_TO_QUEUE":
      const songToAdd = action.payload
      const addSongId = songToAdd.id || songToAdd._id
      
      // Don't add if already in queue
      if (findSongIndex(state.queue, addSongId) > -1) {
        return state
      }
      
      return {
        ...state,
        queue: [...state.queue, songToAdd]
      }

    case "REMOVE_FROM_QUEUE":
      const indexToRemove = action.payload
      if (indexToRemove < 0 || indexToRemove >= state.queue.length) return state
      
      const newQueueAfterRemove = [...state.queue]
      newQueueAfterRemove.splice(indexToRemove, 1)
      
      let newQueueIndexAfterRemove = state.queueIndex
      
      // Adjust current index if needed
      if (indexToRemove < state.queueIndex) {
        newQueueIndexAfterRemove = state.queueIndex - 1
      } else if (indexToRemove === state.queueIndex) {
        // Current song was removed
        if (newQueueAfterRemove.length === 0) {
          return {
            ...state,
            queue: [],
            currentSong: null,
            queueIndex: -1,
            isPlaying: false
          }
        }
        // Adjust index if we're at the end
        if (newQueueIndexAfterRemove >= newQueueAfterRemove.length) {
          newQueueIndexAfterRemove = newQueueAfterRemove.length - 1
        }
      }
      
      return {
        ...state,
        queue: newQueueAfterRemove,
        queueIndex: newQueueIndexAfterRemove
      }

    case "CLEAR_QUEUE":
      return {
        ...state,
        queue: [],
        originalPlaylist: [],
        queueIndex: -1,
        currentSong: null,
        isPlaying: false,
        isShuffled: false
      }

    case "ADD_TO_FAVORITES":
      return {
        ...state,
        favorites: [...state.favorites, action.payload],
      }
    
    case "REMOVE_FROM_FAVORITES":
      return {
        ...state,
        favorites: state.favorites.filter((song) => (song.id || song._id) !== action.payload),
      }
    
    case "ADD_UPLOAD":
      return {
        ...state,
        uploads: [...state.uploads, action.payload],
      }
    
    case "REMOVE_UPLOAD":
      return {
        ...state,
        uploads: state.uploads.filter((song) => (song.id || song._id) !== action.payload),
      }
    
    case "UPDATE_UPLOAD":
      return {
        ...state,
        uploads: state.uploads.map((song) =>
          (song.id || song._id) === (action.payload.id || action.payload._id) 
            ? { ...song, ...action.payload.updates } 
            : song
        ),
      }
    
    case "CREATE_PLAYLIST":
      return {
        ...state,
        playlists: [...state.playlists, action.payload],
      }
    
    case "DELETE_PLAYLIST":
      return {
        ...state,
        playlists: state.playlists.filter((playlist) => playlist.id !== action.payload),
      }
    
    case "UPDATE_PLAYLIST":
      return {
        ...state,
        playlists: state.playlists.map((playlist) =>
          playlist.id === action.payload.id ? { ...playlist, ...action.payload.updates } : playlist
        ),
      }
    
    case "ADD_SONG_TO_PLAYLIST":
      return {
        ...state,
        playlists: state.playlists.map((playlist) =>
          playlist.id === action.payload.playlistId
            ? { ...playlist, songs: [...playlist.songs, action.payload.song] }
            : playlist
        ),
      }
    
    case "REMOVE_SONG_FROM_PLAYLIST":
      return {
        ...state,
        playlists: state.playlists.map((playlist) =>
          playlist.id === action.payload.playlistId
            ? {
              ...playlist,
              songs: playlist.songs.filter((song) => (song.id || song._id) !== action.payload.songId)
            }
            : playlist
        ),
      }
    
    case "SET_QUEUE":
      return { ...state, queue: action.payload }
    
    case "LOAD_DATA":
      return {
        ...state,
        favorites: action.payload.favorites || state.favorites,
        uploads: action.payload.uploads || state.uploads,
        playlists: action.payload.playlists || state.playlists,
        volume: action.payload.volume !== undefined ? action.payload.volume : state.volume,
        repeatMode: action.payload.repeatMode || state.repeatMode,
      }
    
    default:
      return state
  }
}

export function MusicProvider({ children }) {
  const [state, dispatch] = useReducer(musicReducer, initialState)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("musicAppData")
      if (savedData) {
        const parsed = JSON.parse(savedData)
        dispatch({ type: "LOAD_DATA", payload: parsed })
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // Save data to localStorage when state changes (but not during initial load)
  useEffect(() => {
    if (!isInitialized) return // Don't save during initial load

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
    }
  }, [state.favorites, state.uploads, state.playlists, state.volume, state.repeatMode, isInitialized])

  // Enhanced music control functions with proper state management
  const playSong = (song, playlist = [], shouldShuffle = false) => {
    dispatch({ 
      type: "PLAY_SONG", 
      payload: { song, playlist, shouldShuffle } 
    })
  }

  const playNext = () => {
    if (state.isSkipping) return // Prevent multiple clicks
    dispatch({ type: "SET_SKIPPING", payload: true })
    dispatch({ type: "PLAY_NEXT" })
  }

  const playPrevious = () => {
    if (state.isSkipping) return // Prevent multiple clicks
    dispatch({ type: "SET_SKIPPING", payload: true })
    dispatch({ type: "PLAY_PREVIOUS" })
  }

  const toggleShuffle = () => {
    dispatch({ type: "TOGGLE_SHUFFLE" })
  }

  const toggleRepeat = () => {
    dispatch({ type: "TOGGLE_REPEAT" })
  }

  const setRepeatMode = (mode) => {
    dispatch({ type: "SET_REPEAT_MODE", payload: mode })
  }

  const addToQueue = (song) => {
    dispatch({ type: "ADD_TO_QUEUE", payload: song })
  }

  const removeFromQueue = (index) => {
    dispatch({ type: "REMOVE_FROM_QUEUE", payload: index })
  }

  const clearQueue = () => {
    dispatch({ type: "CLEAR_QUEUE" })
  }

  // Helper functions
  const hasNext = () => {
    if (state.queue.length === 0 || state.queueIndex === -1) return false
    return state.queueIndex < state.queue.length - 1 || state.repeatMode === 'all'
  }

  const hasPrevious = () => {
    if (state.queue.length === 0 || state.queueIndex === -1) return false
    return state.queueIndex > 0 || state.repeatMode === 'all' || state.currentTime > 3
  }

  const getNextSong = () => {
    if (state.queue.length === 0 || state.queueIndex === -1) return null
    
    const nextIndex = state.queueIndex + 1
    if (nextIndex < state.queue.length) {
      return state.queue[nextIndex]
    }
    
    if (state.repeatMode === 'all' && state.queue.length > 0) {
      return state.queue[0]
    }
    
    return null
  }

  const getPreviousSong = () => {
    if (state.queue.length === 0 || state.queueIndex === -1) return null
    
    if (state.currentTime > 3) {
      return state.currentSong // Restart current song
    }
    
    const prevIndex = state.queueIndex - 1
    if (prevIndex >= 0) {
      return state.queue[prevIndex]
    }
    
    if (state.repeatMode === 'all' && state.queue.length > 0) {
      return state.queue[state.queue.length - 1]
    }
    
    return null
  }

  // Original playlist functions
  const createPlaylist = (name, description = "") => {
    const newPlaylist = {
      id: `playlist_${Date.now()}`,
      name,
      description,
      songs: [],
    }
    dispatch({ type: "CREATE_PLAYLIST", payload: newPlaylist })
    return newPlaylist
  }

  const deletePlaylist = (playlistId) => {
    dispatch({ type: "DELETE_PLAYLIST", payload: playlistId })
  }

  const updatePlaylist = (playlistId, updates) => {
    dispatch({ type: "UPDATE_PLAYLIST", payload: { id: playlistId, updates } })
  }

  const addSongToPlaylist = (playlistId, song) => {
    dispatch({ type: "ADD_SONG_TO_PLAYLIST", payload: { playlistId, song } })
  }

  const removeSongFromPlaylist = (playlistId, songId) => {
    dispatch({ type: "REMOVE_SONG_FROM_PLAYLIST", payload: { playlistId, songId } })
  }

  const contextValue = {
    state,
    dispatch,
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
    // Original playlist functions
    createPlaylist,
    deletePlaylist,
    updatePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
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