import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50">
        <Navigation />
      </header>
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
