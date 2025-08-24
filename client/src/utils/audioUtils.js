// utils/audioUtils.js

/**
 * Get duration from an audio file and return formatted MM:SS
 */
export const getAudioDuration = (file) => {
  return new Promise((resolve) => {
    const audio = new Audio()
    audio.addEventListener("loadedmetadata", () => {
      const duration = audio.duration
      const minutes = Math.floor(duration / 60)
      const seconds = Math.floor(duration % 60)
      resolve(`${minutes}:${seconds.toString().padStart(2, "0")}`)
    })
    audio.src = URL.createObjectURL(file)
  })
}

/**
 * Format time in seconds to MM:SS format
 */
export const formatTime = (time) => {
  if (!time || isNaN(time)) return "0:00"
  
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

/**
 * Convert MM:SS format back to seconds
 */
export const parseTime = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return 0
  
  // Handle various formats and edge cases
  const trimmed = timeString.trim()
  if (trimmed === '' || trimmed === '0:00') return 0
  
  // Split by colon
  const parts = trimmed.split(':')
  
  // Handle different formats
  if (parts.length === 2) {
    // MM:SS format
    const minutes = parseInt(parts[0], 10) || 0
    const seconds = parseInt(parts[1], 10) || 0
    
    // Validate seconds (should be 0-59)
    if (seconds >= 60) {
      console.warn(`Invalid seconds value: ${seconds}. Should be 0-59.`)
      return minutes * 60 + (seconds % 60) + Math.floor(seconds / 60) * 60
    }
    
    return minutes * 60 + seconds
  } else if (parts.length === 3) {
    // H:MM:SS format (hours:minutes:seconds)
    const hours = parseInt(parts[0], 10) || 0
    const minutes = parseInt(parts[1], 10) || 0
    const seconds = parseInt(parts[2], 10) || 0
    
    return hours * 3600 + minutes * 60 + seconds
  } else if (parts.length === 1) {
    // Just seconds (no colon)
    const seconds = parseInt(parts[0], 10) || 0
    return seconds
  }
  
  // Invalid format
  console.warn(`Invalid time format: ${timeString}`)
  return 0
}

/**
 * Alternative version with more strict validation
 */
export const parseTimeStrict = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return 0
  
  // Regex for MM:SS format (strict)
  const timeRegex = /^(\d{1,2}):([0-5]?\d)$/
  const match = timeString.trim().match(timeRegex)
  
  if (!match) {
    console.warn(`Invalid time format: ${timeString}. Expected MM:SS format.`)
    return 0
  }
  
  const minutes = parseInt(match[1], 10)
  const seconds = parseInt(match[2], 10)
  
  return minutes * 60 + seconds
}

/**
 * Convert milliseconds to MM:SS format (for API data)
 */
export const formatDurationFromMs = (milliseconds) => {
  if (!milliseconds || isNaN(milliseconds)) return "0:00"
  
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

/**
 * Convert MM:SS format to milliseconds (for API data)
 */
export const parseDurationToMs = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return 0
  
  const parts = timeString.split(':')
  if (parts.length !== 2) return 0
  
  const minutes = parseInt(parts[0], 10) || 0
  const seconds = parseInt(parts[1], 10) || 0
  
  return (minutes * 60 + seconds) * 1000
}

/**
 * Calculate total duration for a list of songs
 */
export const calculateTotalDuration = (songs) => {
  const totalSeconds = songs.reduce((total, song) => {
    const duration = song.duration || "0:00"
    return total + parseTime(duration)
  }, 0)
  
  return formatTime(totalSeconds)
}

/**
 * Validate audio file type
 */
export const isValidAudioFile = (file) => {
  if (!file) return false
  
  const validTypes = [
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/m4a',
    'audio/aac',
    'audio/flac'
  ]
  
  return validTypes.includes(file.type)
}

/**
 * Get audio file info
 */
export const getAudioFileInfo = (file) => {
  return new Promise((resolve, reject) => {
    if (!isValidAudioFile(file)) {
      reject(new Error('Invalid audio file type'))
      return
    }
    
    const audio = new Audio()
    
    audio.addEventListener("loadedmetadata", () => {
      const duration = audio.duration
      const minutes = Math.floor(duration / 60)
      const seconds = Math.floor(duration % 60)
      
      resolve({
        duration: `${minutes}:${seconds.toString().padStart(2, "0")}`,
        durationSeconds: duration,
        size: file.size,
        type: file.type,
        name: file.name
      })
      
      // Clean up
      URL.revokeObjectURL(audio.src)
    })
    
    audio.addEventListener("error", () => {
      reject(new Error('Failed to load audio file'))
      URL.revokeObjectURL(audio.src)
    })
    
    audio.src = URL.createObjectURL(file)
  })
}

// Usage examples and tests
const examples = [
  { input: "2:05", expected: 125 },
  { input: "0:45", expected: 45 },
  { input: "10:30", expected: 630 },
  { input: "0:00", expected: 0 },
  { input: "1:23:45", expected: 5025 }, // H:MM:SS format
  { input: "", expected: 0 },
  { input: null, expected: 0 },
  { input: "invalid", expected: 0 }
]

// Test function
export const testParseTime = () => {
  console.log("Testing parseTime function:")
  examples.forEach(({ input, expected }) => {
    const result = parseTime(input)
    const status = result === expected ? "✅" : "❌"
    console.log(`${status} parseTime("${input}") = ${result} (expected: ${expected})`)
  })
}