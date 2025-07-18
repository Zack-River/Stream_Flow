// Load profile info
fetch("/profile/data")
  .then((res) => res.json())
  .then((data) => {
    const { profileImg, name, username } = data.user || {};
    document.getElementById("profileImage").src =
      profileImg || "/assets/images/default-profile.jpg";
    document.getElementById("name").textContent = name || "Unknown";
    document.getElementById("username").textContent = "@" + (username || "");
    if (profileImg) {
      document.getElementById("profileBtnImage").src = profileImg;
      document.getElementById("profileBtnImage").hidden = false;
      document.getElementById("profileBtnInitial").hidden = true;
    } else {
      document.getElementById("profileBtnInitial").textContent =
        username?.charAt(0).toUpperCase() || "U";
    }
  });

// Search filter
document.getElementById("songSearch").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll(".song-card").forEach((card) => {
    const title = card.dataset.title.toLowerCase();
    const artist = card.dataset.artist.toLowerCase();
    card.style.display = title.includes(q) || artist.includes(q) ? "" : "none";
  });
});

// Load songs dynamically
fetch("/audios/mine")
  .then((res) => res.json())
  .then((data) => {
    const container = document.querySelector(".song-cards");
    container.innerHTML = "";

    if (!data.count) {
      container.innerHTML = "<p>No uploaded songs yet.</p>";
      return;
    }

    data.audios.forEach((audio) => {
  let singers = "";

  if (Array.isArray(audio.singer)) {
    try {
      // 🟢 Remove starting [ and ending ]
      let parts = audio.singer.map(s => s.trim());

      let combined = parts.join(""); // e.g. ["[\"David Guetta\"", "\"Bebe Rexha\"]"] => ["[\"David Guetta\"\"Bebe Rexha\"]"]
      
      // Remove the first [ if it exists and the last ] if it exists
      if (combined.startsWith("[")) combined = combined.slice(1);
      if (combined.endsWith("]")) combined = combined.slice(0, -1);

      // Put back brackets, add comma
      const finalJson = `[${combined}]`.replace(/""/g, '","');

      const parsed = JSON.parse(finalJson);
      singers = Array.isArray(parsed) ? parsed.join(", ") : parsed;

    } catch (err) {
      console.log("Failed to parse:", err);
      singers = audio.singer.join(", ");
    }
  } else {
    singers = audio.singer || "";
  }

  const card = document.createElement("div");
  card.className = "song-card";
  card.dataset.title = audio.title;
  card.dataset.artist = singers;

  card.innerHTML = `
    <img src="${audio.coverImageUrl || "/public/assets/images/default-cover.png"}" alt="Cover" class="song-cover" />
    <div class="song-info-wrapper">
      <div class="song-info">
        <h3>${audio.title}</h3>
        <p>${singers}</p>
      </div>
      <button class="play-btn"
        data-id="${audio._id}"
        data-title="${audio.title}"
        data-artist="${singers}"
        data-cover="${audio.coverImageUrl || "/public/assets/images/default-cover.png"}">
        <i class="fas fa-play"></i>
      </button>
    </div>
  `;

  container.appendChild(card);
});

  });