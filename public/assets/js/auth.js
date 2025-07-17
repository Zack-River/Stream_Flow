const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const loginForm = document.querySelector('.form-login');
const signupForm = document.querySelector('.form-signup');
const signupError = document.getElementById('signup-error');

showSignup.onclick = (e) => {
  e.preventDefault();
  loginForm.classList.remove('active');
  signupForm.classList.add('active');
};

showLogin.onclick = (e) => {
  e.preventDefault();
  signupForm.classList.remove('active');
  loginForm.classList.add('active');
};

signupForm.addEventListener('submit', (e) => {
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6,}$/;

  if (password !== confirmPassword) {
    e.preventDefault();
    signupError.textContent = "Passwords do not match.";
  } else if (!passwordRegex.test(password)) {
    e.preventDefault();
    signupError.textContent = "Password must contain at least 1 lowercase, 1 uppercase, 1 special character and be at least 6 characters long.";
  } else {
    signupError.textContent = "";
  }
});

console.log(document.cookie);