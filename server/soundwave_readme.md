# 🎵 SoundWave

**A full-stack audio streaming platform built with Node.js, Express, and MongoDB**

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4%2B-green.svg)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![API Documentation](https://img.shields.io/badge/API-Swagger-orange.svg)](swagger.yaml)

SoundWave is a robust, production-ready audio streaming application featuring secure JWT authentication, role-based access control, file upload capabilities, and comprehensive admin tools. Built with modern best practices and fully documented APIs.

---

## ✨ Features

### 🔐 Authentication & Security
- **JWT-based authentication** with access and refresh tokens
- **Password reset** via email with secure token validation
- **Role-based access control** (User/Admin)
- **Input validation** with Express Validator
- **Secure cookie handling**

### 🎧 Audio Management
- **Multi-format audio upload** with validation
- **Cover image support** for audio tracks
- **Audio streaming** with proper MIME type handling
- **Private/Public track visibility**
- **Metadata management** (title, genre, duration)

### 👥 User Management
- **User registration and profile management**
- **Admin dashboard** for user oversight
- **Account deactivation/reactivation**
- **User role management**

### 🛠️ Developer Experience
- **Complete Swagger/OpenAPI documentation**
- **Postman collection** for instant API testing
- **Environment-based configuration**
- **Comprehensive error handling**
- **RESTful API design**

---

## 🏗️ Architecture

```
SoundWave/
├── 📁 controllers/          # Business logic & route handlers
│   ├── authController.js    # Authentication logic
│   ├── audioController.js   # Audio management
│   └── adminController.js   # Admin operations
├── 📁 models/              # MongoDB schemas
│   ├── User.js             # User data model
│   └── Audio.js            # Audio metadata model
├── 📁 routes/              # API route definitions
│   ├── auth.js             # Authentication routes
│   ├── audio.js            # Audio CRUD routes
│   └── admin.js            # Admin panel routes
├── 📁 utils/               # Helper functions
│   ├── jwt.js              # JWT token management
│   ├── hash.js             # Password hashing
│   ├── mailer.js           # Email services
│   └── cookies.js          # Cookie utilities
├── 📁 uploads/             # File storage
│   ├── audio/              # Audio files
│   └── covers/             # Cover images
├── 📁 docs/                # Documentation
│   ├── swagger.yaml        # API specification
│   └── SoundWave.postman_collection.json
├── .env.example            # Environment template
├── server.js               # Application entry point
└── package.json            # Dependencies & scripts
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16.0 or higher
- **MongoDB** 4.4 or higher
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/soundwave.git
   cd soundwave
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # Database
   MONGO_URI=mongodb://localhost:27017/soundwave
   
   # JWT Secrets (Generate strong secrets for production)
   ACCESS_SECRET=your-super-secure-access-secret
   REFRESH_SECRET=your-super-secure-refresh-secret
   RESET_SECRET=your-super-secure-reset-secret
   
   # Email Configuration (for password reset)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   
   # File Upload Limits
   MAX_FILE_SIZE=50000000  # 50MB
   ALLOWED_AUDIO_TYPES=audio/mpeg,audio/wav,audio/ogg
   ```

4. **Start the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Verify installation**
   
   Open your browser to `http://localhost:3000` - you should see the API welcome message.

---

## 📖 API Documentation

### Interactive Documentation
- **Swagger UI**: Import `swagger.yaml` into [Swagger Editor](https://editor.swagger.io/)
- **Postman**: Import `SoundWave.postman_collection.json` for instant testing

### Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant DB
    
    Client->>API: POST /register
    API->>DB: Create user
    DB-->>API: User created
    API-->>Client: Success message
    
    Client->>API: POST /login
    API->>DB: Validate credentials
    DB-->>API: User data
    API-->>Client: Access + Refresh tokens
    
    Client->>API: GET /profile (with token)
    API->>API: Verify JWT
    API-->>Client: User profile data
```

### Core Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| **Authentication** | | | |
| `POST` | `/register` | Create new user account | ❌ |
| `POST` | `/login` | Authenticate user | ❌ |
| `POST` | `/logout` | Invalidate session | ✅ |
| `POST` | `/forgot-password` | Request password reset | ❌ |
| `POST` | `/reset-password` | Reset password with token | ❌ |
| **User Profile** | | | |
| `GET` | `/profile` | Get current user profile | ✅ |
| `PUT` | `/profile` | Update user profile | ✅ |
| **Audio Management** | | | |
| `POST` | `/upload/audio` | Upload audio with metadata | ✅ |
| `GET` | `/stream/:id` | Stream audio file | ❌* |
| `PUT` | `/audio/:id` | Update audio metadata | ✅ |
| `DELETE` | `/audio/:id` | Delete audio file | ✅ |
| `GET` | `/audio/user/:username` | Get user's public tracks | ❌ |
| **Admin Panel** | | | |
| `GET` | `/admin/users` | List all users | ✅ (Admin) |
| `PUT` | `/admin/users/:username` | Update user details | ✅ (Admin) |
| `DELETE` | `/admin/users/:username` | Deactivate user account | ✅ (Admin) |
| `GET` | `/admin/audios` | List all audio files | ✅ (Admin) |
| `DELETE` | `/admin/audios/:id` | Delete any audio file | ✅ (Admin) |

*_Private tracks require authentication_

---

## 🧪 Testing with Postman

1. **Import the collection**: `SoundWave.postman_collection.json`

2. **Set up environment variables**:
   - `base_url`: `http://localhost:3000`
   - `access_token`: (will be set automatically after login)

3. **Test workflow**:
   ```
   1. Register → Create account
   2. Login → Get tokens (auto-saved)
   3. Upload Audio → Test file upload
   4. Stream → Test audio playback
   5. Profile → Test user data
   ```

---

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start with nodemon (auto-reload)
npm start           # Production start
npm run lint        # Run ESLint
npm run test        # Run test suite
npm run docs        # Generate API docs
```

### File Upload Guidelines

**Audio Files**:
- **Formats**: MP3, WAV, OGG
- **Max size**: 50MB (configurable)
- **Required**: title, genre
- **Optional**: cover image, privacy setting

**Example Upload**:
```javascript
const formData = new FormData();
formData.append('title', 'My Song');
formData.append('genre', 'Rock');
formData.append('audio', audioFile);
formData.append('cover', imageFile);
formData.append('isPrivate', 'false');

fetch('/upload/audio', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});
```

### Error Handling

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": { /* validation errors */ }
  }
}
```

---

## 🚢 Deployment

### Production Checklist

- [ ] Set strong JWT secrets
- [ ] Configure MongoDB connection string
- [ ] Set up email service (SendGrid, etc.)
- [ ] Configure file storage (AWS S3, CloudFront)
- [ ] Set up SSL certificates
- [ ] Configure CORS for your frontend domain
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting

### Environment Variables
```bash
NODE_ENV=production
PORT=80
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/soundwave
# ... other production configs
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Resources

- 📚 [API Documentation](swagger.yaml)
- 🧪 [Postman Collection](SoundWave.postman_collection.json)
- 🐛 [Report Issues](https://github.com/yourusername/soundwave/issues)
- 💬 [Discussions](https://github.com/yourusername/soundwave/discussions)

---

## 🙏 Acknowledgments

Built with ❤️ using:
- [Node.js](https://nodejs.org/) - Runtime environment
- [Express.js](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Multer](https://github.com/expressjs/multer) - File upload handling
- [JWT](https://jwt.io/) - Authentication tokens

---

**Happy coding and streaming! 🎶✨**

> Made with ❤️ by the SoundWave team