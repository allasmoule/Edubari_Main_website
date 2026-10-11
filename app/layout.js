import { Raleway } from "next/font/google";
import "./globals.css";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "EduBari | Smart Digital Learning Platform",
  description: "EduBari is a modern educational learning platform built to provide smart digital learning, accessible interactive resources, and a seamless online learning experience for institutions and coaching centers in Bangladesh.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${raleway.className} min-h-screen bg-white text-dark antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
