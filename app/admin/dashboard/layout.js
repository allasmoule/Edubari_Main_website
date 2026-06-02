"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Admin/Sidebar";
import DashboardHeader from "@/components/Admin/DashboardHeader";
import { supabase } from "@/lib/supabase";

export default function AdminDashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check initial session
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace("/admin/login");
        } else {
          setUser(session.user);
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.replace("/admin/login");
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          setUser(null);
          router.replace("/admin/login");
        } else {
          setUser(session.user);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-primary-light/30 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tertiary mx-auto mb-4"></div>
          <p className="text-dark/50 font-semibold text-sm">Authenticating admin session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-primary-light/30 to-white relative">
      {/* Subtle background patterns */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.06),transparent_60%)] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.04),transparent_60%)] pointer-events-none z-0" />

      <div className="relative z-10">
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
          <main className="p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-72px)] relative">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
