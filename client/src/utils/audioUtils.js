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

export const formatTime = (time) => {
  if (!time || isNaN(time)) return "0:00"
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}
