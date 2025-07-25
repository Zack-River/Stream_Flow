window.addEventListener("beforeunload", () => {
  localStorage.setItem("currentSongSrc", footerAudio.src);
  localStorage.setItem("currentSongTitle", playerTitle.textContent);
  localStorage.setItem("currentSongArtist", playerArtist.textContent);
  localStorage.setItem("currentSongCover", playerCover.src);
  localStorage.setItem("currentSongTime", footerAudio.currentTime);
  localStorage.setItem("isPlaying", !footerAudio.paused);
});