"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  PieChart,
  Globe,
  Heart,
  Zap,
  Copy,
  GitMerge,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Import tab components
import OverviewTab from "@/components/analytics/OverviewTab";
import CategoriesTab from "@/components/analytics/CategoriesTab";
import SourcesTab from "@/components/analytics/SourcesTab";
import EngagementTab from "@/components/analytics/EngagementTab";
import FetchPerformanceTab from "@/components/analytics/FetchPerformanceTab";
import DuplicatesTab from "@/components/analytics/DuplicatesTab";
import CorrelationsTab from "@/components/analytics/CorrelationsTab";

const tabs = [
  { id: "overview", name: "Overview", icon: LayoutDashboard, color: "blue" },
  { id: "categories", name: "Categories", icon: PieChart, color: "purple" },
  { id: "sources", name: "Sources", icon: Globe, color: "green" },
  { id: "engagement", name: "Engagement", icon: Heart, color: "red" },
  {
    id: "fetch-performance",
    name: "Fetch Performance",
    icon: Zap,
    color: "yellow",
  },
  { id: "duplicates", name: "Duplicates", icon: Copy, color: "orange" },
  { id: "correlations", name: "Correlations", icon: GitMerge, color: "cyan" },
];

const colorClasses = {
  blue: "bg-blue-500/10 border-blue-500/50 text-blue-400",
  purple: "bg-purple-500/10 border-purple-500/50 text-purple-400",
  green: "bg-green-500/10 border-green-500/50 text-green-400",
  red: "bg-red-500/10 border-red-500/50 text-red-400",
  yellow: "bg-yellow-500/10 border-yellow-500/50 text-yellow-400",
  orange: "bg-orange-500/10 border-orange-500/50 text-orange-400",
  cyan: "bg-cyan-500/10 border-cyan-500/50 text-cyan-400",
};

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("7d");
  const [showTabDropdown, setShowTabDropdown] = useState(false);

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  const renderTabContent = () => {
    const props = { timeRange };

    switch (activeTab) {
      case "overview":
        return <OverviewTab {...props} />;
      case "categories":
        return <CategoriesTab {...props} />;
      case "sources":
        return <SourcesTab {...props} />;
      case "engagement":
        return <EngagementTab {...props} />;
      case "fetch-performance":
        return <FetchPerformanceTab {...props} />;
      case "duplicates":
        return <DuplicatesTab {...props} />;
      case "correlations":
        return <CorrelationsTab {...props} />;
      default:
        return <OverviewTab {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-black text-white">
      <main className="w-full ">
        {/* Header Section */}
        <div className="max-w-[1600px] mx-auto space-y-6">
          <div className="px-3   sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
            {/* Title and Time Range */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent mb-1">
                  Analytics Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-400">
                  Deep insights and cross-table analysis
                </p>
              </div>

              {/* Time Range Selector - Desktop */}
              <div className="hidden sm:flex gap-2 bg-gray-800/50 p-1 rounded-xl border border-gray-700/50 shrink-0">
                {["24h", "7d", "30d", "all"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`
                      px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200
                      ${
                        timeRange === range
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                          : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                      }
                    `}
                  >
                    {range === "24h"
                      ? "24h"
                      : range === "7d"
                      ? "7d"
                      : range === "30d"
                      ? "30d"
                      : "All"}
                  </button>
                ))}
              </div>

              {/* Time Range Selector - Mobile */}
              <div className="sm:hidden flex gap-1 bg-gray-800/50 p-0.5 rounded-lg border border-gray-700/50">
                {["24h", "7d", "30d", "all"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`
                      flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all duration-200
                      ${
                        timeRange === range
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                          : "text-gray-400"
                      }
                    `}
                  >
                    {range === "all" ? "All" : range}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs Navigation - Desktop */}
            <div className="hidden md:flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 whitespace-nowrap
                      ${
                        isActive
                          ? `${colorClasses[tab.color]} border-2 shadow-lg`
                          : "bg-gray-800/30 border-2 border-transparent text-gray-400 hover:text-white hover:bg-gray-800/50"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{tab.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Tabs Dropdown - Mobile */}
            <div className="md:hidden relative">
              <button
                onClick={() => setShowTabDropdown(!showTabDropdown)}
                className={`
                  w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200
                  ${colorClasses[activeTabData.color]} border-2 shadow-lg
                `}
              >
                <div className="flex items-center gap-2">
                  <activeTabData.icon className="w-5 h-5" />
                  <span className="text-sm">{activeTabData.name}</span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    showTabDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {showTabDropdown && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowTabDropdown(false)}
                    />

                    {/* Dropdown Menu */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50"
                    >
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveTab(tab.id);
                              setShowTabDropdown(false);
                            }}
                            className={`
                              w-full flex items-center justify-between gap-3 px-4 py-3 transition-colors
                              ${
                                isActive
                                  ? `${colorClasses[tab.color]} border-l-4`
                                  : "hover:bg-gray-700/50 text-gray-300 border-l-4 border-transparent"
                              }
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5" />
                              <span className="text-sm font-medium">
                                {tab.name}
                              </span>
                            </div>
                            {isActive && (
                              <div className="w-2 h-2 rounded-full bg-current" />
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-[1800px] mx-auto"
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
