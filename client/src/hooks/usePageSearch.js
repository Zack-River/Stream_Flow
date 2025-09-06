import { useState, useEffect, useCallback, useMemo } from 'react'
import { useDebouncedCallback } from './useDebounce'

export const usePageSearch = (
  songs = [],
  searchFunction = null, // For API search (HomePage only)
  debounceDelay = 500,
  toastFunction = null
) => {  
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [apiResults, setApiResults] = useState([])

  // Local search function that works on any song array
  const searchLocalSongs = useCallback((query, songsToSearch) => {
    if (!query || !query.trim()) return songsToSearch

    const normalizedQuery = query.toLowerCase().trim()
    
    return songsToSearch.filter(song => {
      // Search in title
      const titleMatch = song.title?.toLowerCase().includes(normalizedQuery)
      
      // Search in artist
      const artistMatch = song.artist?.toLowerCase().includes(normalizedQuery)
      
      // Search in genre
      const genreMatch = song.genre?.toLowerCase().includes(normalizedQuery)
      
      // Search in album (if available)
      const albumMatch = song.album?.toLowerCase().includes(normalizedQuery)
      
      return titleMatch || artistMatch || genreMatch || albumMatch
    })
  }, [])

  // Debounced search for API calls (HomePage only)
  const [debouncedApiSearch] = useDebouncedCallback(
    async (query) => {
      if (!searchFunction || !query.trim()) {
        setIsSearching(false)
        setApiResults([])
        return
      }

      try {
        const results = await searchFunction(query)
        setApiResults(results || [])
        setIsSearching(false)
        
        if (toastFunction && results.length === 0) {
          toastFunction(`No results found for "${query}"`, 'info', 2000)
        }
      } catch (error) {
        console.error('Search error:', error)
        setApiResults([])
        setIsSearching(false)
        
        if (toastFunction) {
          toastFunction('Search failed. Please try again.', 'error', 3000)
        }
      }
    },
    debounceDelay,
    [searchFunction, toastFunction]
  )

  // Handle search input changes
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query)
    
    if (searchFunction) {
      // For pages with API search (HomePage)
      if (query.trim()) {
        setIsSearching(true)
        debouncedApiSearch(query)
      } else {
        setIsSearching(false)
        setApiResults([])
      }
    }
  }, [searchFunction, debouncedApiSearch])

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery("")
    setIsSearching(false)
    setApiResults([])
  }, [])

  // Get filtered results based on context
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return songs

    if (searchFunction && apiResults.length > 0) {
      // Use API results for HomePage
      return apiResults
    } else if (searchFunction && isSearching) {
      // Return empty during API search
      return []
    } else {
      // Use local search for other pages
      return searchLocalSongs(searchQuery, songs)
    }
  }, [searchQuery, songs, apiResults, searchFunction, isSearching, searchLocalSongs])

  // Calculate search statistics
  const searchStats = useMemo(() => {
    const totalSongs = songs.length
    const resultCount = searchResults.length
    const isFiltered = searchQuery.trim().length > 0
    
    return {
      total: totalSongs,
      results: resultCount,
      filtered: isFiltered,
      percentage: totalSongs > 0 ? Math.round((resultCount / totalSongs) * 100) : 0
    }
  }, [songs.length, searchResults.length, searchQuery])

  // Update search query externally
  const setExternalSearchQuery = useCallback((query) => {
    if (query !== searchQuery) {
      handleSearchChange(query)
    }
  }, [searchQuery, handleSearchChange])

  return {
    searchQuery,
    searchResults,
    isSearching,
    handleSearchChange,
    clearSearch,
    setSearchQuery: setExternalSearchQuery,
    hasResults: searchResults.length > 0,
    isLocalSearch: !searchFunction,
    searchStats
  }
}