import React, { useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "../Pages/Admin/Dashboard/Components/Sidebar";
import DashboardHeader from "../Pages/Admin/Dashboard/Components/DashboardHeader";

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-primary-light/30 to-white">
            {/* Subtle background patterns */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.06),transparent_60%)] pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.04),transparent_60%)] pointer-events-none" />

            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            {/* Main Content Area */}
            <div
                className={`transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                    collapsed ? "lg:ml-[72px]" : "lg:ml-[264px]"
                }`}
            >
                <DashboardHeader onMenuClick={() => setMobileOpen(true)} />
                <main className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
