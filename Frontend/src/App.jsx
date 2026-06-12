import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import ResumeHistory from "./pages/ResumeHistory";
import AptitudePractice from "./pages/AptitudePractice";
import OAuthSuccess from "./pages/OAuthSuccess";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          
          {/* Support both paths for sign up */}
          <Route path="/register" element={<SignUp />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* OAuth callback handler route */}
          <Route path="/oauth-success" element={<OAuthSuccess />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume-analyzer"
            element={
              <ProtectedRoute>
                <ResumeAnalyzer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume/history"
            element={
              <ProtectedRoute>
                <ResumeHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/aptitude-practice"
            element={
              <ProtectedRoute>
                <AptitudePractice />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

