"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { useState } from "react";

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = "blue",
  description,
  subtitle,
}) {
  const [showInfo, setShowInfo] = useState(false);

  const colorClasses = {
    blue: {
      gradient: "from-blue-500/20 to-blue-600/20",
      border: "border-blue-500/30",
      text: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    green: {
      gradient: "from-green-500/20 to-green-600/20",
      border: "border-green-500/30",
      text: "text-green-400",
      bg: "bg-green-500/10",
    },
    purple: {
      gradient: "from-purple-500/20 to-purple-600/20",
      border: "border-purple-500/30",
      text: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    orange: {
      gradient: "from-orange-500/20 to-orange-600/20",
      border: "border-orange-500/30",
      text: "text-orange-400",
      bg: "bg-orange-500/10",
    },
    red: {
      gradient: "from-red-500/20 to-red-600/20",
      border: "border-red-500/30",
      text: "text-red-400",
      bg: "bg-red-500/10",
    },
    cyan: {
      gradient: "from-cyan-500/20 to-cyan-600/20",
      border: "border-cyan-500/30",
      text: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
    yellow: {
      gradient: "from-yellow-500/20 to-yellow-600/20",
      border: "border-yellow-500/30",
      text: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className={`
        relative overflow-hidden rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6
        bg-gradient-to-br ${colors.gradient}
        border ${colors.border} backdrop-blur-xl
        transition-all duration-300
      `}
    >
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className={`p-2 sm:p-3 rounded-lg lg:rounded-xl ${colors.bg}`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 ${colors.text}" />
          </div>

          <div className="flex items-center gap-2">
            {trend && trendValue !== undefined && (
              <div
                className={`flex items-center gap-1 text-xs sm:text-sm ${
                  trend === "up" ? "text-green-400" : "text-red-400"
                }`}
              >
                {trend === "up" ? (
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
                <span className="font-medium">{trendValue}%</span>
              </div>
            )}

            {description && (
              <div className="relative">
                <button
                  onMouseEnter={() => setShowInfo(true)}
                  onMouseLeave={() => setShowInfo(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                </button>

                {showInfo && (
                  <div className="absolute z-50 right-0 top-full mt-2 w-48 sm:w-64 p-3 bg-gray-800 border border-gray-700 rounded-xl shadow-xl">
                    <p className="text-xs text-gray-400">{description}</p>
                    <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-800 border-l border-t border-gray-700 transform rotate-45"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <h3 className="text-gray-400 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
          {title}
        </h3>
        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white wrap-break-words">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>

        {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
