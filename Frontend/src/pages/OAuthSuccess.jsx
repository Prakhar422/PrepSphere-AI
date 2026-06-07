import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken, logout } = useAuth();
  const calledRef = useRef(false);

  useEffect(() => {
    // Avoid double-execution in StrictMode
    if (calledRef.current) return;
    calledRef.current = true;

    const token = searchParams.get('token');
    if (token) {
      const verifyAndRedirect = async () => {
        try {
          await loginWithToken(token);
          navigate('/dashboard');
        } catch (err) {
          console.error('OAuth token verification failed:', err);
          logout();
          navigate('/login?error=OAuth token verification failed');
        }
      };
      verifyAndRedirect();
    } else {
      logout();
      navigate('/login?error=OAuth token is missing');
    }
  }, [searchParams, navigate, loginWithToken, logout]);

  return (
    <div className="relative min-h-screen bg-[#050B1F] flex items-center justify-center font-inter overflow-hidden text-white">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px] opacity-60 pointer-events-none" />
      
      {/* Glow ambient lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[130px] pointer-events-none" />

      {/* Loading state indicator */}
      <div className="flex flex-col items-center space-y-4 z-10 text-center">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-slate-950/80 border border-white/10 overflow-hidden shadow-[0_0_20px_rgba(99,102,241,0.3)]">
          <svg className="w-8 h-8 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" fill="currentColor" className="text-indigo-500 animate-pulse" />
            <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34l-1.41-1.41" />
          </svg>
          <div className="absolute inset-1 rounded-full border border-dashed border-indigo-500/30 animate-spin" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white tracking-wider uppercase">Completing Secure OAuth Log In</h3>
          <p className="text-[10px] text-slate-500 font-light mt-0.5">Redirecting to console...</p>
        </div>
      </div>
    </div>
  );
};

export default OAuthSuccess;
