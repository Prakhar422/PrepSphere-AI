<div align="center">

# PrepSphere AI - Backend Server ⚙️

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)

This directory contains the REST API server codebase of the **PrepSphere AI** application. It is built as a RESTful web service using Node.js, Express.js, MongoDB Atlas (with Mongoose ODM), and third-party AI APIs.

</div>

---

## 🔧 API URL

**Backend API:**
https://prepsphere-ai-backend.onrender.com

---

## 🏗️ Backend Architecture

The server adheres to a modular MVC (Model-View-Controller) structure representing clean database-logic division:

```text
Backend/
├── controllers/            # Route request logic handlers
├── middleware/             # Route interceptors (JWT auth guards, file upload filters)
├── models/                 # Mongoose schemas mapping MongoDB collections
├── routes/                 # REST API Express endpoints path definitions
├── services/               # Third-party integrations (Cloudinary, AI Engines)
├── utils/                  # Shared helper constants, streak calculators, PDF formats
├── config/                 # Database connectors and platform config files
├── server.js               # Express application wrapper and gateway configurations
└── package.json
```

---

## 🔒 Authentication Flow (JWT)

Authentication is implemented natively using JSON Web Tokens (JWT) for stateless sessions:

1. **Sign Up**: The candidate registers with name, email, college, and password. The password is hashed using `bcryptjs` before storage.
2. **Sign In**: The candidate provides credentials. Upon validation, the server signs a JWT containing the candidate's ID and role.
3. **Session Verification**: The token is sent to the client and stored in `localStorage` or `sessionStorage`. For subsequent authenticated requests, the client attaches the JWT to the `Authorization: Bearer <token>` header.
4. **Google OAuth login**: Google ID Token is validated via the Google Auth Library on the backend, creating or retrieving a matching candidate record, and returns a signed JWT.

---

## 🛡️ Middleware Explanation

- **`authMiddleware.js`**: Parses the `Authorization` header, extracts the Bearer token, verifies its signature against `JWT_SECRET`, and attaches the decoded candidate ID (`req.user`) to the request object. Blocks unauthorized requests with a `401 Unauthorized` response.
- **`uploadMiddleware.js`**: Utilizes `multer` memory storage to capture file buffers (resumes or profile photos) before uploading them to Cloudinary. Ensures file size constraints (<5MB) and type restrictions (.pdf, .docx, images) are enforced.

---

## 🗄️ Database Schema Overview

The database contains four primary collections managed via Mongoose:

1. **User Schema**: Holds candidate name, hashed password, email, college information, bio, graduation details, profile picture URL, and practice streak metrics.
2. **Resume Schema**: Tracks uploaded resume documents stored in Cloudinary (URL, filename, public ID) and references the user who uploaded it.
3. **Interview Schema**: Logs mock interview details (category, role, company, difficulty, questions, evaluations score, and full chat transcripts).
4. **Quiz Schema**: Logs historical aptitude practices (category, difficulty, questions list, correctness list, elapsed time, final score, and detailed explanation metrics).

---

## 🔌 API Endpoints Table

### Authentication API
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login user and return JWT | No |
| `POST` | `/api/auth/google` | Validate Google ID token and return JWT | No |
| `GET` | `/api/auth/me` | Fetch active user profile details | Yes |

### Dashboard API
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/summary` | Fetch dashboard analytics metrics | Yes |

### Resume Analyzer API
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/resume/upload` | Upload resume, trigger AI parsing & ATS scan | Yes |
| `GET` | `/api/resume/history` | Retrieve user's resume scans history list | Yes |
| `GET` | `/api/resume/:id` | Fetch specific resume analysis detail | Yes |
| `DELETE` | `/api/resume/:id` | Delete resume document and metadata | Yes |

### Aptitude Practice API
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/aptitude/dashboard` | Fetch overall user's aptitude analytics | Yes |
| `POST` | `/api/aptitude/generate` | Generate personalized aptitude quiz questions | Yes |
| `POST` | `/api/aptitude/submit` | Submit selected answers & evaluate score | Yes |
| `GET` | `/api/aptitude/history` | List all historical quiz attempts | Yes |
| `GET` | `/api/aptitude/history/:id` | Fetch detailed report for a specific attempt | Yes |

### Mock Interview API (Groq AI)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/interview/start` | Initialize interview session & get first prompt | Yes |
| `POST` | `/api/interview/respond` | Send user answer, get evaluation & next question | Yes |
| `GET` | `/api/interview/history` | List candidate mock interview history | Yes |
| `GET` | `/api/interview/report/:id` | Get overall technical & communication feedback report | Yes |

### Interview Experiences Hub
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/experiences` | Fetch all shared placement experiences | Yes |
| `POST` | `/api/experiences/create` | Share a new placement experience | Yes |
| `PUT` | `/api/experiences/like/:id` | Toggle like status | Yes |
| `PUT` | `/api/experiences/bookmark/:id` | Toggle bookmark status | Yes |

---

## ⚙️ Environment Variables

Create a `.env` file in the root of the `Backend/` folder:

```env
PORT=5000

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/prepsphere

# Authentication
JWT_SECRET=your_jwt_signing_secret_key

# Frontend URL
CLIENT_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret_key
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret_key
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# AI APIs
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

---

## 🛠️ Commands

Run these scripts from the `Backend/` directory:

| Command | Action | Description |
| :--- | :--- | :--- |
| `npm install` | Install dependencies | Downloads node modules |
| `npm run dev` | Launch dev server | Starts server in development mode using `nodemon` |
| `npm start` | Production start | Starts backend server using node |
