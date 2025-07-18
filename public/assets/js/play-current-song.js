const savedSrc = localStorage.getItem("currentSongSrc");
const savedTitle = localStorage.getItem("currentSongTitle");
const savedArtist = localStorage.getItem("currentSongArtist");
const savedCover = localStorage.getItem("currentSongCover");
const savedTime = parseFloat(localStorage.getItem("currentSongTime") || "0");
const wasPlaying = localStorage.getItem("isPlaying") === "true";

if (savedSrc) {
  footerAudio.src = savedSrc;
  playerTitle.textContent = savedTitle || "No Song";
  playerArtist.textContent = savedArtist || "---";
  playerCover.src = savedCover || "./assets/images/default-cover.png";

  footerAudio.addEventListener("loadedmetadata", () => {
    footerAudio.currentTime = savedTime;
    if (wasPlaying) {
      footerAudio.play().catch((err) => {
        console.log("Autoplay blocked:", err);
      });
    }
  });
}