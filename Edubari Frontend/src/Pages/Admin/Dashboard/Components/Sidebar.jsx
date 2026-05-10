import React, { useContext, useEffect } from "react";
import { NavLink, useNavigate } from "react-router";
import {
  FiGrid,
  FiUsers,
  FiBriefcase,
  FiCheckSquare,
  FiCreditCard,
  FiFileText,
  FiMessageSquare,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiX,
  FiHome,
  FiImage,
  FiUserPlus,
} from "react-icons/fi";
import { AuthContext } from "../../../../Firebase/AuthContext";

const navItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: FiGrid, end: true },
  { path: "/admin/dashboard/plans", label: "Plans", icon: FiCreditCard },
  {
    path: "/admin/dashboard/subscriptions",
    label: "Subscriptions",
    icon: FiBriefcase,
  },
  { path: "/admin/dashboard/users", label: "Users", icon: FiUsers },
  {
    path: "/admin/dashboard/create-user",
    label: "Create User",
    icon: FiUserPlus,
  },
  // { path: "/admin/dashboard/projects", label: "Projects", icon: FiBriefcase },
  {
    path: "/admin/dashboard/work-proof",
    label: "Work Proof",
    icon: FiCheckSquare,
  },
  {
    path: "/admin/dashboard/home-banners",
    label: "Home Banners",
    icon: FiImage,
  },
  { path: "/admin/dashboard/blogs", label: "Blogs", icon: FiFileText },
  {
    path: "/admin/dashboard/messages",
    label: "Messages",
    icon: FiMessageSquare,
  },
  // { path: "/admin/dashboard/settings", label: "Settings", icon: FiSettings },
];

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const { logOut } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      setMobileOpen(false);
      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  // Close mobile drawer on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setMobileOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const sidebarContent = (isMobile = false) => {
    const isExpanded = isMobile ? true : !collapsed;

    return (
      <div className="flex flex-col h-full">
        {/* Brand */}
        <div
          className={`flex items-center ${isExpanded ? "px-6" : "px-0 justify-center"} h-[72px] shrink-0`}
        >
          {isExpanded ? (
            <div className="flex items-center justify-between w-full">
              <h1 className="text-[22px] font-black tracking-tight text-dark select-none">
                Edu
                <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">
                  Bari
                </span>
              </h1>
              {isMobile && (
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-dark/40 hover:text-dark/70 hover:bg-dark/5 transition-all duration-200 cursor-pointer"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-tertiary to-[#8B5CF6] flex items-center justify-center shadow-md shadow-tertiary/20">
              <span className="text-white font-black text-sm">E</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className={`mx-${isExpanded ? "5" : "3"} h-px bg-dark/8`} />

        {/* Back to Website Button */}
        <div className={`mt-4 ${isExpanded ? "px-3" : "px-2"}`}>
          <a
            href="/"
            className={`group relative flex items-center ${isExpanded ? "gap-3 px-4 py-3" : "justify-center px-0 py-3"} rounded-xl text-sm font-medium text-dark/55 hover:bg-dark/[0.04] hover:text-dark transition-all duration-200 no-underline`}
          >
            <FiHome className="w-[18px] h-[18px] shrink-0" />
            {isExpanded && <span>Back to Website</span>}

            {!isExpanded && !isMobile && (
              <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-dark text-white text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-lg z-[100] pointer-events-none">
                Back to Website
                <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-dark rotate-45 rounded-[1px]" />
              </span>
            )}
          </a>
        </div>

        {/* Divider */}
        <div className={`mx-${isExpanded ? "5" : "3"} h-px bg-dark/8 mt-3`} />

        {/* Navigation */}
        <nav
          className={`flex-1 overflow-y-auto mt-4 ${isExpanded ? "px-3" : "px-2"} space-y-1`}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => isMobile && setMobileOpen(false)}
              className={({ isActive }) =>
                `group relative flex items-center ${isExpanded ? "gap-3 px-4 py-3" : "justify-center px-0 py-3"} rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-linear-to-r from-tertiary/12 to-[#8B5CF6]/8 text-tertiary shadow-sm shadow-tertiary/5 border border-tertiary/10"
                    : "text-dark/55 hover:bg-dark/[0.04] hover:text-dark/80"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-linear-to-b from-tertiary to-[#8B5CF6] rounded-r-full" />
                  )}
                  <item.icon
                    className={`w-[18px] h-[18px] shrink-0 transition-colors duration-200 ${
                      isActive
                        ? "text-tertiary"
                        : "text-dark/40 group-hover:text-dark/60"
                    }`}
                  />
                  {isExpanded && <span>{item.label}</span>}

                  {/* Tooltip for collapsed state */}
                  {!isExpanded && !isMobile && (
                    <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-dark text-white text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-lg z-[100] pointer-events-none">
                      {item.label}
                      <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-dark rotate-45 rounded-[1px]" />
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div
          className={`mt-auto ${isExpanded ? "px-3" : "px-2"} pb-4 space-y-2`}
        >
          <div
            className={`h-px ${isExpanded ? "mx-2" : "mx-1"} bg-dark/8 mb-2`}
          />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`group relative w-full flex items-center ${isExpanded ? "gap-3 px-4 py-3" : "justify-center py-3"} rounded-xl text-sm font-medium text-dark/55 hover:bg-red-50 hover:text-red-500 transition-all duration-200 cursor-pointer`}
          >
            <FiLogOut className="w-[18px] h-[18px] shrink-0 transition-colors duration-200 group-hover:text-red-500" />
            {isExpanded && <span>Logout</span>}
            {!isExpanded && !isMobile && (
              <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-dark text-white text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-lg z-[100] pointer-events-none">
                Logout
                <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-dark rotate-45 rounded-[1px]" />
              </span>
            )}
          </button>

          {/* Collapse Toggle (desktop only) */}
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`w-full flex items-center ${isExpanded ? "gap-3 px-4" : "justify-center"} py-2.5 rounded-xl text-xs font-semibold text-dark/35 hover:text-dark/55 hover:bg-dark/[0.04] transition-all duration-200 cursor-pointer`}
            >
              {collapsed ? (
                <FiChevronRight className="w-4 h-4 shrink-0" />
              ) : (
                <>
                  <FiChevronLeft className="w-4 h-4 shrink-0" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-screen z-40 bg-white/70 backdrop-blur-xl border-r border-white/30 shadow-[4px_0_24px_rgba(0,0,0,0.03)] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
          collapsed ? "w-[72px]" : "w-[264px]"
        }`}
      >
        {sidebarContent(false)}
      </aside>

      {/* Mobile Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 bg-dark/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-screen w-[280px] z-50 bg-white/95 backdrop-blur-xl shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent(true)}
      </aside>
    </>
  );
};

export default Sidebar;
