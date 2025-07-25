
# 📖 Ghanily API Documentation

This doc describes how to connect your **frontend** with the Ghanily backend.

---

## 🌐 Base URL

http://localhost:5000/api

---

## 🔐 Auth Endpoints

### 1️⃣ Register

**POST** `/api/auth/register`

**Body:**
{
  "username": "zackriver",
  "email": "zack@example.com",
  "password": "mypassword"
}

**Response:**
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": {
    "_id": "id",
    "username": "zackriver",
    "email": "zack@example.com"
  }
}

---

### 2️⃣ Login

**POST** `/api/auth/login`

**Body:**
{
  "email": "zack@example.com",
  "password": "mypassword"
}

**Response:**
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": {
    "_id": "id",
    "username": "zackriver",
    "email": "zack@example.com"
  }
}

---

## 🎵 Music Endpoints

### 3️⃣ Get All Songs

**GET** `/api/music`

**Response:**
[
  {
    "_id": "id",
    "title": "Song Title",
    "artist": "Artist Name",
    "coverUrl": "http://.../uploads/cover.jpg",
    "audioUrl": "http://.../uploads/audio.mp3"
  }
]

---

### 4️⃣ Get Single Song

**GET** `/api/music/:id`

**Response:**
{
  "_id": "id",
  "title": "Song Title",
  "artist": "Artist Name",
  "coverUrl": "http://.../uploads/cover.jpg",
  "audioUrl": "http://.../uploads/audio.mp3"
}

---

### 5️⃣ Upload New Song (Protected)

**POST** `/api/music`

**Headers:**
Authorization: Bearer <JWT_TOKEN>

**Form Data:**
- `title` — (string)
- `artist` — (string)
- `cover` — (file)
- `audio` — (file)

**Response:**
{
  "success": true,
  "message": "Song uploaded successfully"
}

---

## ✅ Notes for Frontend

- Use **JWT token** for protected routes.
- To stream audio → use `audioUrl` directly in `<audio>` tag.
- Use `multipart/form-data` for uploads.
