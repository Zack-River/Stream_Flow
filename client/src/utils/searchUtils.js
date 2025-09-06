
export const normalizeSearchTerm = (term) => {
  if (!term || typeof term !== 'string') return ''
  return term.toLowerCase().trim()
}

export const searchInText = (text, query) => {
  if (!text || !query) return false
  return normalizeSearchTerm(text).includes(normalizeSearchTerm(query))
}

export const searchSongs = (songs, query) => {
  if (!query || !query.trim()) return songs
  
  const normalizedQuery = normalizeSearchTerm(query)
  
  return songs.filter(song => {
    // Search in title
    if (searchInText(song.title, normalizedQuery)) return true
    
    // Search in artist
    if (searchInText(song.artist, normalizedQuery)) return true
    
    // Search in genre
    if (searchInText(song.genre, normalizedQuery)) return true
    
    // Search in album (if available)
    if (searchInText(song.album, normalizedQuery)) return true
    
    // Search in description (if available)
    if (searchInText(song.description, normalizedQuery)) return true
    
    return false
  })
}

export const searchPlaylists = (playlists, query) => {
  if (!query || !query.trim()) return playlists
  
  const normalizedQuery = normalizeSearchTerm(query)
  
  return playlists.filter(playlist => {
    // Search in playlist name
    if (searchInText(playlist.name, normalizedQuery)) return true
    
    // Search in playlist description
    if (searchInText(playlist.description, normalizedQuery)) return true
    
    // Search in songs within the playlist
    if (playlist.songs && playlist.songs.some(song => 
      searchInText(song.title, normalizedQuery) || 
      searchInText(song.artist, normalizedQuery) ||
      searchInText(song.genre, normalizedQuery)
    )) return true
    
    return false
  })
}

export const getSearchStats = (results, total, query) => {
  const resultsCount = Array.isArray(results) ? results.length : 0
  const totalCount = Array.isArray(total) ? total.length : (typeof total === 'number' ? total : 0)
  
  return {
    total: totalCount,
    results: resultsCount,
    query: query ? query.trim() : '',
    hasResults: resultsCount > 0,
    percentage: totalCount > 0 ? Math.round((resultsCount / totalCount) * 100) : 0
  }
}

// Advanced search by category
export const searchByCategory = (songs, query, category = 'all') => {
  if (!query || !query.trim()) return songs
  
  const normalizedQuery = normalizeSearchTerm(query)
  
  switch (category) {
    case 'title':
      return songs.filter(song => searchInText(song.title, normalizedQuery))
    
    case 'artist':
      return songs.filter(song => searchInText(song.artist, normalizedQuery))
    
    case 'genre':
      return songs.filter(song => searchInText(song.genre, normalizedQuery))
    
    case 'album':
      return songs.filter(song => searchInText(song.album, normalizedQuery))
    
    default:
      return searchSongs(songs, query)
  }
}

// Get unique search suggestions
export const getSearchSuggestions = (songs, query, limit = 5) => {
  if (!query || query.length < 2) return []
  
  const normalizedQuery = normalizeSearchTerm(query)
  const suggestions = new Set()
  
  songs.forEach(song => {
    // Add matching titles
    if (song.title && searchInText(song.title, normalizedQuery)) {
      suggestions.add(song.title)
    }
    
    // Add matching artists
    if (song.artist && searchInText(song.artist, normalizedQuery)) {
      suggestions.add(song.artist)
    }
    
    // Add matching genres
    if (song.genre && searchInText(song.genre, normalizedQuery)) {
      suggestions.add(song.genre)
    }
  })
  
  return Array.from(suggestions).slice(0, limit)
}

// Sort search results by relevance
export const sortSearchResults = (results, query) => {
  if (!query || !results || !results.length) return results
  
  const normalizedQuery = normalizeSearchTerm(query)
  
  return results.sort((a, b) => {
    // Exact title matches get highest priority
    const aExactTitle = normalizeSearchTerm(a.title || '') === normalizedQuery
    const bExactTitle = normalizeSearchTerm(b.title || '') === normalizedQuery
    if (aExactTitle && !bExactTitle) return -1
    if (bExactTitle && !aExactTitle) return 1
    
    // Title starts with query gets next priority
    const aTitleStarts = normalizeSearchTerm(a.title || '').startsWith(normalizedQuery)
    const bTitleStarts = normalizeSearchTerm(b.title || '').startsWith(normalizedQuery)
    if (aTitleStarts && !bTitleStarts) return -1
    if (bTitleStarts && !aTitleStarts) return 1
    
    // Artist matches get next priority
    const aArtistMatch = searchInText(a.artist, normalizedQuery)
    const bArtistMatch = searchInText(b.artist, normalizedQuery)
    if (aArtistMatch && !bArtistMatch) return -1
    if (bArtistMatch && !aArtistMatch) return 1
    
    // Default alphabetical sort
    return (a.title || '').localeCompare(b.title || '')
  })
}