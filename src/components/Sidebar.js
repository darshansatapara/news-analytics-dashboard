"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  Database,
  Activity,
  FileText,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Layers,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/",
    description: "Overview & Analytics",
  },
  {
    icon: Newspaper,
    label: "News Articles",
    href: "/news",
    description: "All fetched articles",
  },
  {
    icon: Layers,
    label: "News Map",
    href: "/newsmap",
    description: "Duplicate tracking",
  },
  {
    icon: Activity,
    label: "GNews Logs",
    href: "/logs/gnews",
    description: "API fetch logs",
  },
  {
    icon: FileText,
    label: "RSS Logs",
    href: "/logs/rss",
    description: "RSS feed logs",
  },
  {
    icon: TrendingUp,
    label: "Analytics",
    href: "/analytics",
    description: "Deep insights",
  },
];

export default function Sidebar({ isOpen = false, onClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobile && onClose) {
      onClose();
    }
  }, [pathname, isMobile]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobile, isOpen]);

  const SidebarContent = () => (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative bg-gray-900/95 backdrop-blur-xl border-r border-gray-800/50 flex flex-col h-full"
    >
      {/* Logo Area */}
      <div className="p-4 lg:p-6 border-b border-gray-800/50">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                key="full-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-base lg:text-lg font-bold">
                    News Analytics
                  </h2>
                  <p className="text-xs text-gray-400">v1.0.0</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex justify-center w-full"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Close button for mobile */}
          {isMobile && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 lg:p-4 space-y-1 lg:space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && onClose?.()}
              className={`
                group relative flex items-center gap-3 px-3 py-2.5 lg:py-3 rounded-xl
                transition-all duration-200
                ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 text-white"
                    : "hover:bg-gray-800/50 text-gray-400 hover:text-white"
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-xl"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}

              <Icon
                className={`w-5 h-5 shrink-0 relative z-10 ${
                  isActive ? "text-blue-400" : ""
                }`}
              />

              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 relative z-10"
                  >
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-gray-500 group-hover:text-gray-400 hidden lg:block">
                      {item.description}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Toggle Button - Desktop Only */}
      {!isMobile && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full flex items-center justify-center transition-colors z-50 hidden lg:flex"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          )}
        </button>
      )}

      {/* Footer */}
      <div
        className={`p-3 lg:p-4 border-t border-gray-800/50 ${
          isCollapsed ? "text-center" : ""
        }`}
      >
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="full-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-gray-500"
            >
              <p>© 2025 News Analytics</p>
              <p className="mt-1">Made with ❤️ in India</p>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-gray-500"
            >
              ❤️
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );

  // Mobile: Render as drawer overlay
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={onClose}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop: Render normally
  return <SidebarContent />;
}
