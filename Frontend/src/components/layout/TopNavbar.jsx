import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Menu, Search, Bell, User as UserIcon } from "lucide-react";

const TopNavbar = ({
  onMenuClick,
  searchQuery = "",
  setSearchQuery,
  searchPlaceholder,
  userName,
  userCollege,
  profilePic,
  children
}) => {
  const { user } = useAuth();
  const location = useLocation();

  const currentPath = location.pathname;
  
  // Dynamic greeting prefix match
  const greetingPrefix = currentPath === "/dashboard" ? "Welcome Back" : "Welcome";

  // Resolve display values (prop overrides or auth fallbacks)
  const displayName = userName !== undefined ? userName : (user?.name || "User");
  const displayCollege = userCollege !== undefined ? userCollege : (user?.college || "PrepSphere College");
  const displayAvatarLetter = displayName.charAt(0).toUpperCase() || "U";

  // Dynamic placeholder lookup
  const getSearchPlaceholder = () => {
    if (searchPlaceholder) return searchPlaceholder;
    if (currentPath === "/dashboard") return "Search resources, contests, experiences...";
    if (currentPath === "/aptitude-practice" || currentPath.startsWith("/aptitude/history")) return "Search resources, templates, equations...";
    if (currentPath === "/resume-analyzer" || currentPath.startsWith("/resume/history")) return "Search resume templates, analysis tips...";
    if (currentPath === "/mock-interview") return "Search interview patterns, behaviors...";
    if (currentPath === "/coding-journey" || currentPath === "/coding-tracker") return "Search problems, algorithms, categories...";
    if (currentPath === "/interview-experiences") return "Search by company, role, technology, or keyword...";
    return "Search settings, integrations...";
  };

  return (
    <header className="sticky top-0 z-30 bg-[#050B1F]/70 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between shrink-0">
      {/* Mobile Menu & Search Box */}
      <div className="flex items-center space-x-4 flex-1 max-w-lg">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 lg:hidden focus:outline-none shrink-0 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            placeholder={getSearchPlaceholder()}
            className="w-full bg-slate-950/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-300 placeholder:text-slate-600 font-inter"
          />
        </div>
      </div>

      {/* Bell Notification & User Profile Greeting */}
      <div className="flex items-center space-x-6 shrink-0 pl-4">
        {children}
        {/* <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
        </button> */}

        <div className="flex items-center space-x-3 border-l border-white/5 pl-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">
              {greetingPrefix}, {displayName.split(" ")[0]}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 max-w-[150px] truncate">
              {displayCollege}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px] shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <div className="w-full h-full rounded-xl bg-[#080E24] flex items-center justify-center text-indigo-400 text-sm font-bold overflow-hidden">
              {profilePic ? (
                <img src={profilePic} alt="Avatar" className="w-full h-full object-cover" />
              ) : displayName ? (
                displayAvatarLetter
              ) : (
                <UserIcon className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
