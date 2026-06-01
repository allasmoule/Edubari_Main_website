import "./globals.css";

export const metadata = {
  title: "EduBari | Smart Digital Learning Platform",
  description: "EduBari is a modern educational learning platform built to provide smart digital learning, accessible interactive resources, and a seamless online learning experience for institutions and coaching centers in Bangladesh.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-dark antialiased">
        {children}
      </body>
    </html>
  );
}
