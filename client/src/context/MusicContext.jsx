import { createContext, useContext, useReducer, useEffect, useState } from "react"

const MusicContext = createContext()

const initialState = {
  currentSong: null,
  isPlaying: false,
  volume: 0.6,
  currentTime: 0,
  duration: 0,
  playlist: [],
  queue: [],
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
  isRepeating: false,
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
    case "ADD_TO_FAVORITES":
      return {
        ...state,
        favorites: [...state.favorites, action.payload],
      }
    case "REMOVE_FROM_FAVORITES":
      return {
        ...state,
        favorites: state.favorites.filter((song) => song.id !== action.payload),
      }
    case "ADD_UPLOAD":
      return {
        ...state,
        uploads: [...state.uploads, action.payload],
      }
    case "REMOVE_UPLOAD":
      return {
        ...state,
        uploads: state.uploads.filter((song) => song.id !== action.payload),
      }
    case "UPDATE_UPLOAD":
      return {
        ...state,
        uploads: state.uploads.map((song) =>
          song.id === action.payload.id ? { ...song, ...action.payload.updates } : song
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
              songs: playlist.songs.filter((song) => song.id !== action.payload.songId)
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
      }
      localStorage.setItem("musicAppData", JSON.stringify(dataToSave))
    } catch (error) {
      console.error("Error saving data to localStorage:", error)
    }
  }, [state.favorites, state.uploads, state.playlists, state.volume, isInitialized])

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