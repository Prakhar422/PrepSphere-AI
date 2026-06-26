<div align="center">

# PrepSphere AI 🚀
### AI-Powered Placement Preparation Platform

[![Vercel Deployment](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Render Deployment](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://render.com)
[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)](https://mongodb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

An AI-powered placement preparation platform designed to help students master coding interviews, practice aptitude tests, optimize resumes with ATS matching, and gain comprehensive feedback through simulated AI mock interviews.

</div>

---

## 📌 Project Overview

**PrepSphere AI** is a comprehensive, full-stack web application designed for students preparing for placements. It bridges the gap between learning and evaluation by offering features like an automated ATS resume score scanner, real-time AI mock interviews, custom-generated aptitude quizzes, coding analytics tracking, and a collaborative hub for sharing interview experiences.

---

## ✨ Features

- **🔐 Secure Authentication**: Full sign-in flow utilizing JWT token storage and secure logout, supplemented with Google OAuth integration.
- **📊 Analytics Dashboard**: Central command center tracking overall readiness score, aptitude stats, ATS resume matching, and interview practice progression.
- **🧠 Aptitude Practice**: Custom, topic-wise, and adaptive quizzes generated using AI templates to test quant, logical reasoning, verbal, and data interpretation.
- **💻 Coding Journey**: Track problems solved by category (Arrays, DP, Graphs, etc.) and difficulty (Easy, Medium, Hard), complete with a visual coding score metrics tracker.
- **📄 Resume Analyzer**: Upload resume PDFs/docs for a deep ATS analysis score, diagnostics on skills match/formatting, list of missing keywords, and recruiter feedback.
- **💬 AI Mock Interview**: Experience technical, behavioral, or system design interviews tailored to specific roles (e.g., Software Engineer) and target companies (e.g., Google) utilizing the Groq API.
- **🤝 Interview Experiences**: Sharing platform where students can search, review, bookmark, and publish real interview experiences.
- **🔥 Gamification Streak**: Integrated streak tracking to motivate consistent daily preparation.
- **🎨 Premium Theme UI**: Sleek, fully responsive dark glassmorphism layout matching state-of-the-art developer standards.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React.js | Reactive User Interface |
| | Vite | Fast Next-Gen Build Tool |
| | Tailwind CSS | Modern CSS Styling Framework |
| | React Router | Declarative Client-Side Routing |
| | Axios | HTTP client for Backend API calls |
| | Recharts | Premium Interactive SVG Charts |
| | Framer Motion | Smooth Micro-Animations |
| | Lucide React | Clean Vector Icons Library |
| **Backend** | Node.js | Scalable Server Environment |
| | Express.js | Backend REST APIs Router |
| | JWT | Secure User Authentication |
| | Multer | Multipart File Upload handling |
| | Cloudinary | Secure Cloud Resume File Storage |
| | Gemini / Groq API | AI-powered Scenarios & Assessments |
| **Database** | MongoDB Atlas | Cloud Document Database |
| **Deployment** | Vercel | Frontend hosting |
| | Render | Backend REST APIs hosting |

---

## 📂 Project Structure

```text
PrepSphere/
├── Frontend/             # React.js application
│   ├── src/
│   │   ├── components/   # Reusable UI elements (layout, coding, landing page)
│   │   ├── contexts/     # Global state context providers (AuthContext)
│   │   ├── pages/        # Route components (Dashboard, CodingJourney, etc.)
│   │   ├── services/     # API Axios integrations
│   │   └── utils/        # PDF generators and format helpers
│   ├── public/           # Static asset assets (favicons, manifest)
│   ├── index.html        # Main HTML wrapper
│   └── package.json
│
├── Backend/              # Node.js Express server
│   ├── controllers/      # Route logic handlers
│   ├── models/           # Mongoose schemas (User, Resume, Interview)
│   ├── routes/           # REST API Route declarations
│   ├── middleware/       # JWT Auth and file interceptors
│   ├── services/         # Third-party integrations (Cloudinary, AI Engines)
│   ├── utils/            # Helper utilities
│   ├── server.js         # Entry point
│   └── package.json
│
└── README.md             # Root documentation
```

---

## ⚙️ Installation & Setup

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v16 or higher) and [npm](https://www.npmjs.com/) installed on your local machine.

### Step 1: Clone the Repository
```bash
git clone https://github.com/Prakhar422/PrepSphere-AI.git
cd PrepSphere-AI
```

---

## 🔌 Environment Variables

You must set up `.env` files in the `Backend/` directories.



### Backend (`Backend/.env`)
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

## 🚀 Running Locally

### 1. Run the Backend Server
```bash
cd Backend
npm install
npm run dev
```
*The server will start at `http://localhost:5000`.*

### 2. Run the Frontend Client
```bash
cd ../Frontend
npm install
npm run dev
```
*The client will start at `http://localhost:5173`.*

---

<!-- ## 📸 Screenshots

*Placeholders for application screenshots:*

#### 📊 Dashboard Command Center
`![Dashboard Showcase](https://via.placeholder.com/800x450?text=PrepSphere+AI+Dashboard)`

#### 📄 ATS Resume Analyzer
`![Resume Scan Results](https://via.placeholder.com/800x450?text=PrepSphere+AI+Resume+Analyzer)`

#### 💬 AI Mock Interview Console
`![Mock Interview Session](https://via.placeholder.com/800x450?text=PrepSphere+AI+Mock+Interview)`

--- -->

## 🔮 Future Enhancements
- **👥 Peer Coding Arena**: Real-time collaborative coding lobbies with integrated audio rooms.
- **📈 Advanced System Design Canvas**: Drag-and-drop builder for custom architecture diagrams with automated AI feedback.
- **🤖 Specialized ML Interviewers**: Finely tuned interview agents matching specific developer roles (iOS, DevOps, Data Science).

---

## ✍️ Author

- **Name**: Prakhar Garg
- **College**: Jabalpur Engineering College
- **Degree**: B.Tech Information Technology (Class of 2026)
- **GitHub**: [github.com/Prakhar422](https://github.com/Prakhar422) 
- **LinkedIn**: [linkedin.com/in/prakhar-garg](www.linkedin.com/in/prakhar-garg-60a7a8256) 

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
