    fetch('/profile/data')
      .then(response => response.json())
      .then(data => {
          document.getElementById('profileBtnImage').src = data.user.profileImg;
      })
      .catch(error => console.error('Error loading profile:', error));

document.getElementById('uploadBtn').addEventListener('click', async () => {
  const title = document.getElementById('title').value.trim();
  const genre = document.getElementById('genre').value.trim();
  const singers = document.getElementById('singer').value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const audio = document.getElementById('audioInput').files[0];
  const cover = document.getElementById('coverInput').files[0];
  const isPrivate = document.querySelector('input[name="isPrivate"]').checked;

  if (!title || !genre || singers.length === 0 || !audio || !cover) {
    alert('Please fill in all fields.');
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('genre', genre);

  // ✅ MUST JSON.stringify or backend will break
  formData.append('singer', JSON.stringify(singers));

  formData.append('audio', audio);
  formData.append('cover', cover);
  formData.append('isPrivate', isPrivate);

  try {
    const response = await fetch('/audios/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    if (response.ok) {
      alert('Song uploaded successfully!');
      window.location.href = '/profile';
    } else {
      alert(result.message || 'Upload failed.');
    }
  } catch (err) {
    console.error(err);
    alert('Something went wrong.');
  }
});

  // Cover image
const coverUploadBox = document.getElementById('coverUploadBox');
const coverInput = document.getElementById('coverInput');
const coverPreview = document.getElementById('coverPreview');

coverUploadBox.addEventListener('click', () => coverInput.click());
coverInput.addEventListener('change', () => {
  const file = coverInput.files[0];
  if (file && file.type.startsWith('image/')) {
    coverPreview.src = URL.createObjectURL(file);
    coverPreview.hidden = false;

    coverUploadBox.querySelector('i').style.display = 'none';
    coverUploadBox.querySelector('span').style.display = 'none';
  }
});

const audioUploadBox = document.getElementById('audioUploadBox');
const audioInput = document.getElementById('audioInput');
const audioPreview = document.getElementById('audioPreview');
const canvas = document.getElementById('visualizer');

audioUploadBox.addEventListener('click', () => audioInput.click());
audioInput.addEventListener('change', () => {
  const file = audioInput.files[0];
  if (file && file.type.startsWith('audio/')) {
    audioPreview.src = URL.createObjectURL(file);
    audioPreview.hidden = false;
    audioUploadBox.querySelector('i').style.display = 'none';
    audioUploadBox.querySelector('span').style.display = 'none';
  }
});