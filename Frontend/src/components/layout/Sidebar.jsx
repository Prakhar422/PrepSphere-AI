import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { sidebarNavigation } from "../../constants/navigation";
import { X, LogOut } from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const currentPath = location.pathname;

  // Active route checking helper
  const isItemActive = (itemPath) => {
    if (itemPath === "/dashboard") {
      return currentPath === "/dashboard";
    }
    if (itemPath === "/aptitude-practice") {
      return currentPath === "/aptitude-practice" || currentPath.startsWith("/aptitude/history");
    }
    if (itemPath === "/resume-analyzer") {
      return currentPath === "/resume-analyzer" || currentPath.startsWith("/resume/history");
    }
    if (itemPath === "/coding-journey") {
      return currentPath === "/coding-journey" || currentPath === "/coding-tracker";
    }
    return currentPath === itemPath;
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
    navigate("/");
  };

  const handleNavClick = (path) => {
    if (onClose) onClose();
    navigate(path);
  };

  return (
    <>
      {/* SIDEBAR - DESKTOP */}
      <aside className="fixed left-0 top-0 h-screen w-[280px] hidden lg:flex flex-col bg-slate-950/40 border-r border-white/5 backdrop-blur-xl z-20 overflow-hidden text-left">
        {/* Logo */}
        <div className="p-6 flex items-center space-x-3 border-b border-white/5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-slate-950/80 border border-white/10 overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.25)]">
            <svg
              className="w-4 h-4 text-indigo-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle
                cx="12"
                cy="12"
                r="3"
                fill="currentColor"
                className="text-indigo-500 animate-pulse"
              />
              <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34l-1.41-1.41" />
            </svg>
          </div>
          <span className="text-base font-extrabold tracking-tight text-white font-inter">
            PrepSphere{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              AI
            </span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {sidebarNavigation.map((item, idx) => {
            const active = isItemActive(item.path);
            return (
              <button
                key={idx}
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-left text-base font-medium transition-all duration-200 cursor-pointer ${
                  active
                    ? "bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-300 border border-indigo-500/25 shadow-[0_4px_20px_rgba(99,102,241,0.08)]"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent"
                }`}
              >
                <item.icon
                  className={`w-4 h-4 ${active ? "text-indigo-400" : "text-slate-500"}`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-left text-base font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 cursor-pointer focus:outline-none"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER SIDEBAR */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />

            {/* Sidebar Drawer Container */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] bg-[#050B1F]/95 border-r border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col justify-between lg:hidden text-left"
            >
              <div>
                <div className="p-5 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center">
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="3" fill="currentColor" />
                        <path d="M12 2v2M12 20v2M4 12H2M22 12h-2" />
                      </svg>
                    </div>
                    <span className="text-base font-bold text-white">
                      PrepSphere AI
                    </span>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="px-3 py-5 space-y-1">
                  {sidebarNavigation.map((item, idx) => {
                    const active = isItemActive(item.path);
                    return (
                      <button
                        key={idx}
                        onClick={() => handleNavClick(item.path)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-base font-medium transition-all duration-200 cursor-pointer ${
                          active
                            ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-300 border-l-[3px] border-indigo-500 pl-3.5"
                            : "text-slate-400 hover:text-white hover:bg-white/5 pl-4"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-4 border-t border-white/5">
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-left text-base font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* LOGOUT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md bg-[#080E24]/90 border border-white/10 rounded-2xl p-6 shadow-[0_0_50px_rgba(99,102,241,0.15)] backdrop-blur-xl overflow-hidden text-left"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent pointer-events-none" />

              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                  <LogOut className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Confirm Sign Out</h3>
                  <p className="text-sm text-slate-400 font-light mt-1.5 leading-relaxed">
                    Are you sure you want to log out of PrepSphere AI? You will need to sign in again to access your dashboard.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 mt-6 justify-end">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] text-slate-300 hover:text-white text-sm font-medium transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.25)]"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
