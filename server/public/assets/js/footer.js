// === Make these global for other files ===
window.footerAudio = document.getElementById("footerAudio");
window.playerTitle = document.getElementById("playerTitle");
window.playerArtist = document.getElementById("playerArtist");
window.playerCover = document.getElementById("playerCover");

// Local-only elements (DO NOT attach to window!)
const playPauseBtn = document.getElementById("playPauseBtn");
const repeatBtn = document.getElementById("repeatBtn");
const seekBar = document.getElementById("seekBar");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");

// === Footer player logic ===
let isRepeat = false;

repeatBtn.onclick = () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle("active", isRepeat);
  footerAudio.loop = isRepeat;
};

playPauseBtn.onclick = () => {
  footerAudio.paused ? footerAudio.play() : footerAudio.pause();
};

footerAudio.onplay = () => {
  playPauseBtn.querySelector("i").className = "fas fa-pause";
};
footerAudio.onpause = () => {
  playPauseBtn.querySelector("i").className = "fas fa-play";
};

footerAudio.ontimeupdate = () => {
  seekBar.value = footerAudio.duration
    ? (footerAudio.currentTime / footerAudio.duration) * 100
    : 0;
  currentTimeEl.textContent = formatTime(footerAudio.currentTime);
  durationEl.textContent = formatTime(footerAudio.duration);
};

seekBar.oninput = () => {
  footerAudio.currentTime = (seekBar.value / 100) * footerAudio.duration;
};

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".play-btn");
  if (btn) {
    const id = btn.dataset.id;
    footerAudio.src = `/audios/stream/${id}`;
    playerTitle.textContent = btn.dataset.title;
    playerArtist.textContent = btn.dataset.artist || "Unknown";
    playerCover.src = btn.dataset.cover || "./assets/images/default-cover.png";
    footerAudio.play();
  }
});

function formatTime(s) {
  if (!s) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}