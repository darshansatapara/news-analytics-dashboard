"use client";

import { motion } from "framer-motion";
import { ExternalLink, Eye, Clock } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function RecentArticles({ articles }) {
  if (!articles || articles.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6">
        <p className="text-center text-gray-400 text-sm">No recent articles</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6"
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="truncate">Recent Articles</span>
        </h3>
        <Link
          href="/news"
          className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition-colors shrink-0"
        >
          View All →
        </Link>
      </div>

      <div className="space-y-2 sm:space-y-3 max-h-[350px] sm:max-h-[400px] overflow-y-auto pr-1 sm:pr-2">
        {articles.map((article, index) => (
          <motion.div
            key={article._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-800/30 border border-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-gray-800/50 transition-all group"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-xs sm:text-sm text-white line-clamp-2 group-hover:text-blue-400 transition-colors mb-2">
                  {article.title}
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                  <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded capitalize shrink-0">
                    {article.category}
                  </span>
                  <span className="truncate max-w-[120px] sm:max-w-none">
                    {article.source}
                  </span>
                  {article.publishedAt && (
                    <span className="flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {format(new Date(article.publishedAt), "MMM dd, HH:mm")}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-start shrink-0">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Eye className="w-3 h-3" />
                  <span>{article.viewsCount || 0}</span>
                </div>
                <Link
                  href={`/news/${article.articleId}`}
                  className="p-1.5 sm:p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
