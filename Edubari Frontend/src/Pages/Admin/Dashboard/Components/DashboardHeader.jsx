import React, { useState, useRef, useEffect, useContext } from "react";
import {
  FiSearch,
  FiBell,
  FiMenu,
  FiChevronDown,
  FiUser,
  FiSettings,
  FiLogOut,
  FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router";
import { AuthContext } from "../../../../Firebase/AuthContext";

const DashboardHeader = ({ onMenuClick }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { logOut } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await logOut();
      setProfileOpen(false);
      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 h-[72px] bg-white/60 backdrop-blur-lg border-b border-white/20 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      {/* Left Side */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-1 rounded-xl text-dark/50 hover:text-dark hover:bg-dark/5 transition-all duration-200 cursor-pointer"
          aria-label="Open menu"
        >
          <FiMenu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-lg sm:text-xl font-bold text-dark tracking-tight">
            Dashboard
          </h2>
          <p className="text-xs text-dark/40 font-medium hidden sm:block">
            Welcome back, Admin
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search */}
        <div className="relative hidden sm:block" ref={searchRef}>
          <div
            className={`flex items-center rounded-xl border transition-all duration-300 ${searchOpen ? "w-[240px] border-tertiary/30 bg-white/80 shadow-sm" : "w-[180px] border-white/40 bg-white/50"}`}
          >
            <FiSearch className="w-4 h-4 text-dark/30 ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
              className="w-full px-2 py-2.5 text-sm bg-transparent outline-none placeholder:text-dark/30 text-dark font-medium"
            />
          </div>
        </div>

        {/* Mobile search icon */}
        <button className="sm:hidden p-2.5 rounded-xl text-dark/50 hover:text-dark hover:bg-dark/5 transition-all duration-200 cursor-pointer">
          <FiSearch className="w-[18px] h-[18px]" />
        </button>

        {/* Notification Bell */}
        <button className="relative p-2.5 rounded-xl text-dark/50 hover:text-dark hover:bg-dark/5 transition-all duration-200 cursor-pointer">
          <FiBell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-dark/8 hidden sm:block" />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-dark/[0.04] transition-all duration-200 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-tertiary to-[#8B5CF6] flex items-center justify-center shadow-md shadow-tertiary/20">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="text-sm font-semibold text-dark/70 hidden sm:inline">
              Admin
            </span>
            <FiChevronDown
              className={`w-3.5 h-3.5 text-dark/30 transition-transform duration-200 hidden sm:block ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-[200px] rounded-xl border border-white/40 bg-white/90 backdrop-blur-xl shadow-xl shadow-dark/8 py-1.5 animate-[fadeInUp_0.2s_ease-out]">
              <div className="px-4 py-2.5 border-b border-dark/5">
                <p className="text-sm font-bold text-dark">Admin User</p>
                <p className="text-xs text-dark/40 font-medium">
                  admin@edubari.com
                </p>
              </div>
              {[
                { icon: FiUser, label: "Profile" },
                { icon: FiSettings, label: "Settings" },
              ].map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-dark/65 font-medium hover:bg-dark/[0.04] hover:text-dark transition-all duration-150 cursor-pointer"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
              <div className="h-px bg-dark/5 my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500/80 font-medium hover:bg-red-50 hover:text-red-600 transition-all duration-150 cursor-pointer"
              >
                <FiLogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
