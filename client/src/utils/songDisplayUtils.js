export const formatArtists = (artistString) => {
    if (!artistString) return "Unknown Artist"

    let cleanedString = artistString
        .replace(/\\"/g, '"')
        .replace(/^"/, '')
        .replace(/"$/, '')

    let artists = []

    if (cleanedString.includes('","')) {
        artists = cleanedString.split('","')
    }
    else if (cleanedString.includes('\",\"')) {
        artists = cleanedString.split('\",\"')
    }
    else {
        artists = [cleanedString]
        const separators = [',', ' & ', ' and ', ' ft. ', ' feat. ', ' featuring ', '+', ' x ']

        for (const separator of separators) {
            if (artists.length === 1 && artists[0].includes(separator)) {
                artists = artists[0].split(separator)
                break
            }
        }
    }

    artists = artists
        .map(artist => artist.trim())
        .map(artist => artist.replace(/^["']+|["']+$/g, ''))
        .filter(artist => artist.length > 0)
        .filter(artist => !['ft', 'feat', 'featuring', 'and'].includes(artist.toLowerCase()))

    artists = [...new Set(artists)]

    if (artists.length === 0) return "Unknown Artist"
    if (artists.length === 1) return artists[0]
    if (artists.length === 2) return `${artists[0]} & ${artists[1]}`
    if (artists.length <= 4) return artists.join(', ')

    return `${artists.slice(0, 3).join(', ')} & ${artists.length - 3} more`
}

export const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export const parseTime = (timeString) => {
    if (!timeString || typeof timeString !== 'string') return 0

    const parts = timeString.split(':').map(Number)

    if (parts.length === 2) {
        return parts[0] * 60 + parts[1]
    } else if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2]
    }

    return 0
}

export const getSongDisplayData = (song) => {
    if (!song) return null

    const displayTitle = song.title || "Unknown Title"
    const rawArtist = song.artist || song.singer || "Unknown Artist"
    const displayArtist = formatArtists(rawArtist)
    const displayCover = song.cover || song.coverImageUrl || "https://placehold.co/200x200/EFEFEF/AAAAAA?text=Song+Cover"
    const displayDuration = song.duration || "0:00"
    const displayGenre = song.genre

    return {
        displayTitle,
        displayArtist,
        rawArtist,
        displayCover,
        displayDuration,
        displayGenre,
        songId: song.id || song._id,
        isUploaded: song.isUploaded || false
    }
}