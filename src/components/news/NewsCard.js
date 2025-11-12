"use client";

import { motion } from "framer-motion";
import { ExternalLink, Eye, Heart, Calendar } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";

export default function NewsCard({ article }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group"
    >
      {/* Image */}
      {article.imageUrl && (
        <div className="relative h-48 bg-gray-800 overflow-hidden">
          <img
            src={article?.imageUrl}
            alt={article?.title}
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-gray-900 to-transparent" />
        </div>
      )}

      <div className="p-5 space-y-3">
        {/* Category & Score */}
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs font-medium text-blue-400">
            {article.category}
          </span>
          {article.score && (
            <span className="text-xs text-gray-400">
              Score:{" "}
              <span className="text-white font-semibold">{article.score}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
          {article.title}
        </h3>

        {/* Description */}
        {article.description && (
          <p className="text-sm text-gray-400 line-clamp-3">
            {article.description}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-800">
          <span className="font-medium">{article.source}</span>
          {article.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(article.publishedAt), "MMM dd, yyyy")}
            </span>
          )}
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {article.viewsCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {article.likesCount || 0}
            </span>
          </div>

          <Link
            href={`/news/${article.articleId}`}
            className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            View
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
