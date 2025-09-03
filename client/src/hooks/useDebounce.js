// hooks/useDebounce.js - Custom debounce hook
import { useState, useEffect, useRef, useCallback } from 'react'

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Alternative implementation using useCallback for more control
export const useDebouncedCallback = (callback, delay, deps = []) => {
  const timeoutRef = useRef(null)
  
  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay, ...deps])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
  
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])
  
  return [debouncedCallback, cancel]
}

// Search-specific hook that combines debouncing with search logic
export const useSearch = (searchFunction, delay = 500, showToast) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const lastSearchQuery = useRef('')

  // Helper function to truncate long search queries for toast messages
  const truncateQuery = (query, maxLength = 15) => {
    if (!query || typeof query !== 'string') return query
    const trimmed = query.trim()
    return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength - 1)}…` : trimmed
  }

  // Debounced search callback
  const [debouncedSearch, cancelSearch] = useDebouncedCallback(
    async (query) => {
      if (!query.trim()) {
        setSearchResults([])
        setIsSearching(false)
        return
      }

      // Skip if it's the same query as before
      if (query === lastSearchQuery.current) {
        setIsSearching(false)
        return
      }

      try {
        setIsSearching(true)
        lastSearchQuery.current = query
        
        const results = await searchFunction(query)
        setSearchResults(results)
        
        // Show "no results" toast only after debounce period
        if (results.length === 0 && showToast) {
          const truncatedQuery = truncateQuery(query)
          showToast(`No results found for "${truncatedQuery}"`, 'warning', 3000)
        }
      } catch (error) {
        console.error('Search error:', error)
        if (showToast) {
          showToast('Search failed. Please try again.', 'error', 4000)
        }
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    },
    delay,
    [searchFunction, showToast]
  )

  // Update search query and trigger debounced search
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query)
    
    if (!query.trim()) {
      // Immediate clear when search is empty
      setSearchResults([])
      setIsSearching(false)
      cancelSearch()
      lastSearchQuery.current = ''
      return
    }
    
    // Trigger debounced search for non-empty queries
    debouncedSearch(query)
  }, [debouncedSearch, cancelSearch])

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchResults([])
    setIsSearching(false)
    cancelSearch()
    lastSearchQuery.current = ''
  }, [cancelSearch])

  return {
    searchQuery,
    searchResults,
    isSearching,
    handleSearchChange,
    clearSearch,
    setSearchQuery // For external updates
  }
}