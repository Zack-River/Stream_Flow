const profilePreview = document.getElementById('profilePreview');
const imageInput = document.getElementById('imageInput');
const profileImage = document.getElementById('profileImage');

const content = document.getElementById('content');

let cropper;
let croppedFile = null;

// Open file picker when preview clicked
profilePreview.addEventListener('click', () => {
  imageInput.click();
});

// When user selects file
imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (file && /^image\/(png|jpeg)$/.test(file.type)) {
    const reader = new FileReader();
    reader.onload = (e) => openCropperModal(e.target.result);
    reader.readAsDataURL(file);
  }
});

function openCropperModal(imageSrc) {
  const overlay = document.createElement('div');
  overlay.className = 'cropper-overlay';

  const modal = document.createElement('div');
  modal.className = 'cropper-modal';

  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'cropper-image-wrapper';

  const img = document.createElement('img');
  img.src = imageSrc;

  const actions = document.createElement('div');
  actions.className = 'cropper-actions';

  const saveBtn = document.createElement('button');
  saveBtn.innerText = 'Save';
  saveBtn.className = 'crop-btn';

  const cancelBtn = document.createElement('button');
  cancelBtn.innerText = 'Cancel';
  cancelBtn.className = 'cancel-btn';

  actions.appendChild(cancelBtn);
  actions.appendChild(saveBtn);

  imageWrapper.appendChild(img);
  modal.appendChild(imageWrapper);
  modal.appendChild(actions);
  overlay.appendChild(modal);
  content.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add('show');
    modal.classList.add('show');
  });

  cropper = new Cropper(img, {
    aspectRatio: 1,
    viewMode: 1,
    autoCropArea: 1,
    responsive: true,
    background: false
  });

  saveBtn.addEventListener('click', async () => {
    const canvas = cropper.getCroppedCanvas({
      width: 200,
      height: 200
    });
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    croppedFile = new File([blob], 'profile.png', { type: 'image/png' });

    profileImage.src = URL.createObjectURL(blob);
    profileImage.hidden = false;

    closeModal();
  });

  cancelBtn.addEventListener('click', closeModal);

  function closeModal() {
    overlay.classList.remove('show');
    modal.classList.remove('show');
    cropper.destroy();
    overlay.addEventListener('transitionend', () => {
      overlay.remove();
    }, { once: true });
  }
}