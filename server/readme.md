# 🎵 Stream Flow

**Stream Flow** is a full-stack **Node.js + Express + MongoDB** audio streaming app — with secure **JWT auth**, **role-based access**, audio **upload**, **streaming**, and a robust **admin panel**.

It’s fully documented with **Swagger** and a **Postman collection** so frontend devs can integrate instantly.

---

## 📦 What’s inside?

- ✅ **User Auth** (Register, Login, Refresh, Reset Password)
- ✅ **Profile management**
- ✅ **Audio upload & streaming**
- ✅ **Admin tools** (Manage users, deactivate, delete audios)
- ✅ **Multer** for file uploads
- ✅ **JWT tokens** (Access, Refresh, Reset)
- ✅ **Nodemailer** for reset password
- ✅ **Express Validator**
- ✅ **Swagger.yaml** for full API docs
- ✅ **Postman collection** for testing & frontend integration

---

## 📁 Folder Structure

Stream Flow/
├─ controllers/ # Route logic (auth, audio, admin)
├─ models/ # Mongoose schemas (User, Audio)
├─ routes/ # API route definitions
├─ utils/ # Helpers: JWT, hash, mailer, cookies
├─ uploads/ # Uploaded audio files + covers
├─ swagger.yaml # OpenAPI documentation
├─ Stream Flow.postman_collection.json
├─ .env # Environment secrets
├─ server.js # Entry point
---

## ⚙️ Setup & Run

1️⃣ **Clone**

```bash
git clone https://github.com/Zack-River/Ghanily_Music_App.git
cd Ghanily_Music_App
```
2️⃣ Install

```bash
npm install
```

3️⃣ Configure

Create a .env file:
PORT=3000
MONGO_URI=mongodb://localhost:27017/Ghanily_Music_App
ACCESS_SECRET=YourAccessSecret
REFRESH_SECRET=YourRefreshSecret
RESET_SECRET=YourResetSecret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=development

4️⃣ Run

```bash
npm run dev
```
4️⃣ Run

```bash
npm run dev
Server runs at http://localhost:3000
```

📡 API Docs
Swagger UI: Open the swagger.yaml in Swagger Editor — or serve with tools like swagger-ui-express.

Postman:

Import Stream Flow.postman_collection.json into Postman.

Set {{base_url}} to your local URL.

Use /register + /login to get tokens.

Add {{access_token}} for secured routes.

📂 Core Endpoints (Summary)
Method	Endpoint	Description
POST	/register	Register new user
POST	/login	Login, receive tokens
GET	/logout	Logout, clear cookies
POST	/forgot-password	Send password reset link
POST	/reset-password	Reset password with token
GET	/profile	Get logged-in user profile
PUT	/profile	Update user profile
POST	/upload/audio	Upload audio & cover image
GET	/stream/:id	Stream audio by ID
PUT	/audio/:id	Update audio details
DELETE	/audio/:id	Delete audio
GET	/admin/users	Admin: Get all users
PUT	/admin/users/:username	Admin: Update user
DELETE	/admin/users/:username	Admin: Deactivate user
GET	/admin/audios	Admin: Get all audios
DELETE	/admin/audios/:id	Admin: Delete audio

🛡️ Auth Flow
Users get accessToken (1 hour) & refreshToken (7 days).

Use accessToken in Authorization: Bearer TOKEN.

Use /forgot-password to send an email link.

Reset with /reset-password.

🔐 Upload Flow
Uses Multer.

Endpoint: /upload/audio

FormData: title, genre, audio (file), cover (file), isPrivate (true/false).

🚀 For Frontend Devs
Use the Postman collection to test every request.

Use variables: {{base_url}} for your server, {{access_token}} for auth routes.

Audio streaming: call /stream/:id to get the audio file.

Update & delete endpoints secured with auth.

🤝 Contributing
Want to add new features?

1️⃣ Fork the repo
2️⃣ Create a new branch
3️⃣ Make changes (keep PRs clean & scoped)
4️⃣ Run npm run lint (if ESLint is configured)
5️⃣ Submit a pull request!

🧑‍💻 Maintainers
Stream Flow Devs
MIT License — Free to use & extend.

⚡ Quick Links
🧩 Swagger Editor — paste swagger.yaml

🧩 Postman — import .json collection

🧩 Multer Docs

Happy coding & streaming! 🎶✨
---

## ✅ **Next**

I can pack this up as:
- `README.md`
- `swagger.yaml`
- `Stream Flow.postman_collection.json`

Just say **“Package it!”** and I’ll generate a **ready-to-download zip** for you! 🚀