const profileBtn = document.getElementById('profileBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

profileBtn.addEventListener('click', () => {
  dropdownMenu.style.display = dropdownMenu.style.display === 'flex' ? 'none' : 'flex';
});

window.addEventListener('click', function(e) {
  if (!profileBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
    dropdownMenu.style.display = 'none';
  }
});

// ✅ ✅ Use footerAudio from global scope!
function loadSong(audioData) {
  footerAudio.src = `/uploads/audio/${audioData.audioUrl}`;
  playerCover.src = audioData.coverImageUrl;
  playerTitle.textContent = audioData.title;
  playerArtist.textContent = audioData.singer.join(', ');
  footerAudio.play();
}