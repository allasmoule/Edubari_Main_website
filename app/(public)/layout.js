"use client";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/context/LanguageContext";

export default function PublicLayout({ children }) {
  return (
    <LanguageProvider>
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50">
          <Navigation />
        </header>
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}
