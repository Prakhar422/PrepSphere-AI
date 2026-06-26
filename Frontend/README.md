<div align="center">

# PrepSphere AI - Frontend Client 💻

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

This directory contains the Frontend user interface codebase of the **PrepSphere AI** application. It is built as a single-page application (SPA) using React.js, Vite, and Tailwind CSS.

</div>

---

## 🏗️ Architecture Overview

The frontend follows a modern, component-driven modular structure:

```text
Frontend/
├── public/                 # Static assets, logos, and favicons
├── src/
│   ├── components/         # Shared and modular UI components
│   │   ├── LandingPage/    # Main marketing page segments (Hero, Navbar, Footer, FAQ, CTA)
│   │   ├── coding/         # DSA-specific widgets (Analytics, CodeEditor, ReportDrawers)
│   │   └── layout/         # Application shell wrapper components (Sidebar, TopNavbar)
│   ├── constants/          # Application configs, constants, navigation lists
│   ├── contexts/           # Context APIs for global states
│   ├── pages/              # Main route views
│   ├── services/           # Interceptors and API service calls
│   ├── utils/              # Client-side helpers (PDF generators)
│   ├── App.jsx             # Main routing shell
│   └── main.jsx            # Entry mount point
├── index.html              # HTML shell template
├── tailwind.config.js      # Tailwind layout extensions
└── vite.config.js          # Vite build instructions
```

---

## 📄 Pages & Modules Explanation

- **📊 Dashboard (`/dashboard`)**: The main analytics dashboard displaying active user metrics, aptitude practice summaries, latest resume scan scores, current preparation streaks, and upcoming preparation reminders.
- **📄 Resume Analyzer (`/resume-analyzer`)**: Drag-and-drop resume uploader providing real-time parsing, ATS keyword alignment matches, missing industry skills reports, formatting checks, and dynamic account summaries downloaded as a PDF report.
- **💬 Mock Interview (`/mock-interview`)**: Real-time mock interview console offering simulated chats across technical, behavioral, and system design categories. Integrates a custom timer, performance diagnostics tracker, and downloadable PDF reports.
- **🧠 Aptitude Practice (`/aptitude-practice`)**: Adaptive quiz interface generating quantitative, logical reasoning, verbal, and data interpretation questions with built-in keyboard navigation support, progress meters, and correct answer breakdowns.
- **💻 Coding Journey (`/coding-journey`)**: Codeeditor console where students can track historical submissions, filter questions by company, solve algorithmic challenges, write C++/Java/Python/JS solutions with auto-save drafts, and view visual category progress charts.
- **🤝 Interview Experiences (`/interview-experiences`)**: Directory where candidates publish and browse real-world placement experiences, featuring tagging, bookmarking, and contributors rankings.

---

## 🚦 Routing Structure

Client-side navigation is managed declaratively using `react-router-dom`:

- `/` - Public Landing Page (Navbar, Hero, FAQ, CTA sections)
- `/login` - Sign In console
- `/signup` - Student registration page
- `/oauth-success` - Callback handler for Google OAuth redirect
- `/dashboard` - Private Student Workspace
- `/aptitude-practice` - Quantitative/Logical reasoning practice launcher
- `/aptitude/history` - Historical scores and metrics
- `/aptitude/report/:attemptId` - In-depth quiz diagnostic review
- `/resume-analyzer` - Resume scanner and advice engine
- `/resume/history` - Historical ATS uploads log
- `/mock-interview` - AI Mock Interview workspace
- `/coding-journey` - DSA tracker and code sandbox
- `/interview-experiences` - Placement experience sharing directory
- `/settings` - Theme customization, account updates, connected platforms configs

---

## 💾 State Management

- **Global Auth State (`AuthContext`)**: Global state manager handling user details, JWT storage initialization on startup, session token verification, registration inputs validation, and secure session clearing.
- **Local Page States**: Utilizes React hooks (`useState`, `useRef`, `useCallback`, `useMemo`) for component-scoped rendering (e.g., chat message arrays, editor solution code buffers, search filter queries, and active animation timers).

---

## 🔌 Environment Variables

Create a `.env` file in the root of the `Frontend/` folder (or `.env.local` for local development):

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
VITE_GEMINI_API_KEY=your_gemini_api_key_here # (Optional) Required if using Gemini API directly on the client
```

*Note: In production, configure these variables inside Vercel's Environment Variables settings.*

---

## 🛠️ Commands

Run these scripts from the `Frontend/` directory:

| Command | Action | Description |
| :--- | :--- | :--- |
| `npm install` | Install dependencies | Downloads node modules |
| `npm run dev` | Launch dev server | Starts application locally at `http://localhost:5173` |
| `npm run build` | Build for production | Compiles application code into the optimized `/dist` folder |
| `npm run preview` | Preview production build | Runs the local production server for diagnostics |
