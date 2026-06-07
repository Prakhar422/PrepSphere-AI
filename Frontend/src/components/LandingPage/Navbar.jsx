import React, { useState, useEffect } from "react";
import { Menu, X, ArrowRight, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState(null);

  const navLinks = [
  { name: "Features", sectionId: "features" },
  { name: "Experiences", sectionId: "experiences" },
  { name: "Resources", sectionId: "resources" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Inject custom styles for typography & keyframe animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        .font-inter {
          font-family: 'Inter', sans-serif;
        }

        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
      `}</style>

      <header
        className={`sticky top-0 left-0 right-0 z-50 w-full transition-all duration-500 font-inter ${
          isScrolled
            ? "bg-[#050B1F]/85 backdrop-blur-lg border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] py-4"
            : "bg-transparent border-b border-white/5 py-5"
        }`}
      >
        {/* Subtle top ambient lighting border */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-white">
          
          {/* Logo Section */}
          <a href="/" className="flex items-center group relative z-10 focus:outline-none">
            {/* Logo subtle purple-blue background aura glow */}
            <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-600/20 opacity-40 blur-xl group-hover:opacity-75 transition duration-500 pointer-events-none" />
            
            {/* High-tech AI Circular Icon */}
            <div className="relative mr-3 flex items-center justify-center w-10 h-10 rounded-full bg-slate-950/90 border border-white/15 overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.25)] transition-all duration-300 group-hover:border-indigo-500/50 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              {/* Rotating dashed ring */}
              <div className="absolute inset-0.5 rounded-full border border-dashed border-indigo-400/40 animate-spin-slow" />
              {/* Static gradient border */}
              <div className="absolute inset-0 rounded-full border border-white/5" />
              
              {/* Inner core grid/circuit elements */}
              <svg className="w-5 h-5 text-indigo-400 group-hover:text-cyan-400 transition-colors duration-300 group-hover:scale-105" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" fill="currentColor" className="text-indigo-500/80 group-hover:text-indigo-400 animate-pulse" />
                <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34l-1.41-1.41" />
              </svg>
            </div>

            {/* Glowing Logo Text */}
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(129,140,248,0.4)] transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]">
              PrepSphere <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span>
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
  const isActive = activeLink === link.name;

  return (
    <button
      key={link.name}
      onClick={() => {
        setActiveLink(link.name);

        document.getElementById(link.sectionId)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }}
      className="relative py-2 text-[15px] font-medium text-slate-300 hover:text-white transition-colors duration-300 focus:outline-none cursor-pointer group"
    >
      <span className="relative z-10">{link.name}</span>

      <span
        className={`absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-350 transform origin-left ${
          isActive
            ? "scale-x-100 opacity-100"
            : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
        }`}
      />
    </button>
  );
})}
          </nav>

          {/* Right Side Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <span className="text-sm font-medium text-indigo-300">
                  Hi, {user.name.split(' ')[0]}
                </span>
                <button
                  onClick={() => navigate("/dashboard")} 
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none"
                >
                  Dashboard
                </button>
                <button
                  onClick={logout}
                  className="relative group inline-flex items-center justify-center p-[1px] rounded-full overflow-hidden text-sm font-medium text-white cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] focus:outline-none"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-full" />
                  <span className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full blur-md opacity-45 group-hover:opacity-85 transition duration-500 group-hover:duration-200" />
                  <span className="relative px-5 py-2 bg-[#050B1F] rounded-full transition-all duration-300 group-hover:bg-transparent flex items-center gap-1.5 font-semibold">
                    Logout
                  </span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")} 
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none"
                >
                  Log in
                </button>
                
                <button 
                  onClick={() => navigate("/register")}
                  className="relative group inline-flex items-center justify-center p-[1px] rounded-full overflow-hidden text-sm font-medium text-white cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] focus:outline-none"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-full" />
                  <span className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full blur-md opacity-45 group-hover:opacity-85 transition duration-500 group-hover:duration-200" />
                  <span className="relative px-6 py-2.5 bg-[#050B1F] rounded-full transition-all duration-300 group-hover:bg-transparent flex items-center gap-1.5 font-semibold">
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center md:hidden z-10">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 focus:outline-none transition-colors duration-200"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Full-Screen Navigation Drawer Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-md transition-opacity duration-500 md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Drawer Container */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-[#050B1F] border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6 flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div>
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/5">
            {/* Logo inside drawer */}
            <div className="flex items-center">
              <div className="relative mr-3 flex items-center justify-center w-8 h-8 rounded-full bg-slate-950/80 border border-white/10 overflow-hidden">
                <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" fill="currentColor" className="text-indigo-500 animate-pulse" />
                  <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34l-1.41-1.41" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-white font-inter">
                PrepSphere <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span>
              </span>
            </div>
            
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 focus:outline-none transition-colors duration-200"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Mobile Nav Links */}
          <nav className="mt-8 flex flex-col space-y-3">
  {navLinks.map((link) => {
    const isActive = activeLink === link.name;

    return (
      <button
        key={link.name}
        onClick={() => {
          setActiveLink(link.name);
          setIsOpen(false);

          setTimeout(() => {
            document.getElementById(link.sectionId)?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }, 300);
        }}
        className={`flex items-center justify-between p-3.5 rounded-xl text-left text-base font-medium transition-all duration-200 cursor-pointer focus:outline-none ${
          isActive
            ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-300 border-l-[3px] border-indigo-500 pl-3"
            : "text-slate-300 hover:text-white hover:bg-white/5 pl-3.5"
        }`}
      >
        <span>{link.name}</span>

        <ChevronRight
          className={`w-4 h-4 transition-transform duration-250 ${
            isActive
              ? "translate-x-1 text-indigo-400"
              : "text-slate-500"
          }`}
        />
      </button>
    );
  })}
</nav>
        </div>

        {/* Drawer Footer Buttons */}
        <div className="pt-6 border-t border-white/5 flex flex-col space-y-4">
          {user ? (
            <>
              <div className="text-center text-xs text-indigo-300 font-medium pb-2 border-b border-white/5">
                Hi, {user.name}
              </div>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  navigate("/dashboard");
                }}
                className="w-full py-3.5 rounded-full text-center text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all duration-200 cursor-pointer focus:outline-none"
              >
                Dashboard
              </button>
              
              <button 
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full relative group inline-flex items-center justify-center p-[1px] rounded-full overflow-hidden text-sm font-semibold text-white cursor-pointer transition-all duration-300 focus:outline-none"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-full" />
                <span className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full blur-md opacity-35 group-hover:opacity-75 transition duration-300" />
                <span className="relative w-full py-3.5 bg-[#050B1F] rounded-full transition-all duration-200 group-hover:bg-transparent flex items-center justify-center gap-2">
                  Logout
                </span>
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  navigate("/login");
                }}
                className="w-full py-3.5 rounded-full text-center text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all duration-200 cursor-pointer focus:outline-none"
              >
                Log in
              </button>
              
              <button 
                onClick={() => {
                  setIsOpen(false);
                  navigate("/register");
                }}
                className="w-full relative group inline-flex items-center justify-center p-[1px] rounded-full overflow-hidden text-sm font-semibold text-white cursor-pointer transition-all duration-300 focus:outline-none"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-full" />
                <span className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full blur-md opacity-35 group-hover:opacity-75 transition duration-300" />
                <span className="relative w-full py-3.5 bg-[#050B1F] rounded-full transition-all duration-200 group-hover:bg-transparent flex items-center justify-center gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
