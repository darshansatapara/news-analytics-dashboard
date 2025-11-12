"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, Activity, Zap } from "lucide-react";

export default function FetchingStats({ data }) {
  if (!data) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6">
        <p className="text-center text-gray-400 text-sm">
          No fetching stats available
        </p>
      </div>
    );
  }

  const { gnews = {}, rss = {} } = data;

  const calculateSuccessRate = (stats) => {
    if (!stats || stats.total === 0) return 0;
    return ((stats.successful / stats.total) * 100).toFixed(1);
  };

  const gnewsRate = calculateSuccessRate(gnews);
  const rssRate = calculateSuccessRate(rss);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6"
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="truncate">Fetching Statistics</span>
        </h3>
        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 shrink-0" />
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* GNews Stats */}
        <div className="p-3 sm:p-4 bg-gray-800/30 rounded-lg sm:rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm sm:text-base font-medium text-gray-300">
              GNews API
            </h4>
            <span
              className={`text-xs sm:text-sm font-semibold px-2 py-1 rounded ${
                parseFloat(gnewsRate) > 80
                  ? "bg-green-500/10 text-green-400"
                  : "bg-orange-500/10 text-orange-400"
              }`}
            >
              {gnewsRate}%
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-400 flex items-center gap-2">
                <Activity className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                <span>Total</span>
              </span>
              <span className="font-medium">{gnews.total || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-400 flex items-center gap-2">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 shrink-0" />
                <span>Success</span>
              </span>
              <span className="font-medium text-green-400">
                {gnews.successful || 0}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-400 flex items-center gap-2">
                <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 shrink-0" />
                <span>Failed</span>
              </span>
              <span className="font-medium text-red-400">
                {(gnews.total || 0) - (gnews.successful || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-gray-700/50">
              <span className="text-gray-400">Articles</span>
              <span className="font-semibold text-blue-400">
                {gnews.totalArticles || 0}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-green-500 to-blue-500 transition-all duration-500"
              style={{ width: `${gnewsRate}%` }}
            />
          </div>
        </div>

        {/* RSS Stats */}
        <div className="p-3 sm:p-4 bg-gray-800/30 rounded-lg sm:rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm sm:text-base font-medium text-gray-300">
              RSS Feeds
            </h4>
            <span
              className={`text-xs sm:text-sm font-semibold px-2 py-1 rounded ${
                parseFloat(rssRate) > 80
                  ? "bg-green-500/10 text-green-400"
                  : "bg-orange-500/10 text-orange-400"
              }`}
            >
              {rssRate}%
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-400 flex items-center gap-2">
                <Activity className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                <span>Total</span>
              </span>
              <span className="font-medium">{rss.total || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-400 flex items-center gap-2">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 shrink-0" />
                <span>Success</span>
              </span>
              <span className="font-medium text-green-400">
                {rss.successful || 0}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-400 flex items-center gap-2">
                <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 shrink-0" />
                <span>Failed</span>
              </span>
              <span className="font-medium text-red-400">
                {(rss.total || 0) - (rss.successful || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-gray-700/50">
              <span className="text-gray-400">Articles</span>
              <span className="font-semibold text-blue-400">
                {rss.totalArticles || 0}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${rssRate}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
