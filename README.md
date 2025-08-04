    
# 🎵 Ghanily Music App

**Ghanily** is a full-stack music streaming application where users can register, log in, upload tracks, and stream music.  
Built with **Node.js**, **Express**, **MongoDB**, and structured for easy integration with a modern frontend (React, Next.js, or any SPA).

---

## 🚀 Live Demo

🌐 [Not Deployed Yet]

---

## 📂 Project Structure
**Backend:**
server/
├── config/         # DB config, environment setup
├── controllers/    # Logic for auth, music, user
├── models/         # Mongoose schemas
├── routes/         # API endpoints
├── middleware/     # Auth, upload, error handling
├── uploads/        # Uploaded files
├── util/           # Utility functions
├── app.js          # Express app
├── server.js       # HTTP server
├── .env.example    # Environment variables template
└── README.md

**Frontend:**
client/
├── Folder/          # comment
├── Folder/          # comment
├── Folder/          # comment
├── Folder/          # comment
├── Folder/          # comment
├── Folder/          # comment
├── Folder/          # comment
├── File.js          # comment
├── File.js          # comment
├── .env.example     # comment
└── README.md

---

## 🧩 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT
- **Uploads:** Multer for audio & images
- **Frontend:** React , tailwind , vite
- **Deployment:** Ready for Render, Railway, or Vercel (backend only)

---

## ⚙️ Setup & Installation

```bash
# Clone the repository
git clone https://github.com/Zack-River/Ghanily_Music_App.git
cd Ghanily_Music_App

# Install dependencies
npm install
```

**Create a `.env` file:** (or use `.env.example`)

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

---

## 🏃 Run Locally

```bash
# Start server
npm start

# Or run with nodemon for development
npm run dev
```

---

## ✅ API Base URL

http://localhost:5000/api

---

## ⚙️ Key Features

- 🔑 Secure JWT Auth
- 📁 Upload songs and cover images
- 🎧 Stream music files
- 🗂️ Organized MVC structure
- 🔗 Ready for front-end integration

---

## 🤝 Contributing

1. Fork it
2. Create your feature branch: `git checkout -b feature/foo`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/foo`
5. Open a Pull Request

---

## 📝 License

MIT

---

## 👋 Author

**Zack River**  
[GitHub](https://github.com/Zack-River)
