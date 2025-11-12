"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import "./globals.css";

export default function RootLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <html lang="en">
      <body className="bg-linear-to-br from-gray-950 via-gray-900 to-black text-white overflow-hidden">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar - Always rendered, visibility controlled by props */}
          <Sidebar
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Navbar with menu toggle */}
            <Navbar onMenuClick={() => setMobileMenuOpen(true)} />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
