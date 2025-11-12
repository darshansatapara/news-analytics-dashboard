"use client";

import { useEffect, useState } from "react";
import { Search, Bell, Clock, Activity, Menu } from "lucide-react";
import { format } from "date-fns";

export default function Navbar({ onMenuClick }) {
  const [currentTime, setCurrentTime] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    setCurrentTime(new Date());
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <nav className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50">
      <div className="px-3 sm:px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-800/50 rounded-xl transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-gray-400" />
          </button>

          {/* Logo - Mobile Only */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold hidden sm:block">
              News Analytics
            </span>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                aria-label="Search news, categories, sources"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news, categories, sources..."
                className="w-full pl-11 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Button - Mobile */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="md:hidden p-2 hover:bg-gray-800/50 rounded-xl transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-gray-400" />
            </button>

            {/* Live Status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="relative">
                <Activity className="w-3.5 h-3.5 text-green-400" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full" />
              </div>
              <span className="text-xs font-medium text-green-400 hidden lg:inline">
                Live
              </span>
            </div>

            {/* Current Time */}
            <div
              className="hidden sm:flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg"
              aria-live="polite"
            >
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <div className="text-xs">
                <div className="font-medium">
                  {currentTime ? format(currentTime, "HH:mm") : "—:—"}
                </div>
                <div className="text-[10px] text-gray-400 hidden lg:block">
                  {currentTime ? format(currentTime, "dd MMM") : ""}
                </div>
              </div>
            </div>

            {/* Notifications */}
            <button
              className="relative p-2 hover:bg-gray-800/50 rounded-xl transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-gray-900" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showSearch && (
          <div className="md:hidden mt-3 animate-in slide-in-from-top-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                aria-label="Search news"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
