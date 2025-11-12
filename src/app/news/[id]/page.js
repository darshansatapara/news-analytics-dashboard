"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import {
  ArrowLeft,
  Eye,
  Heart,
  Share2,
  ExternalLink,
  Calendar,
  User,
  Tag,
  TrendingUp,
  Zap,
  ThumbsUp,
  Clock,
  BookmarkPlus,
  BarChart3,
  Sparkles,
  Award,
  AlertCircle,
  FileText,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchArticle();
    }
  }, [params.id]);

  const fetchArticle = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/news/${params.id}`);

      if (!response.ok) {
        throw new Error("Article not found");
      }

      const result = await response.json();

      if (result.success) {
        setArticle(result.data.article);
        setRelatedArticles(result.data.relatedArticles || []);
      } else {
        throw new Error(result.error || "Failed to load article");
      }
    } catch (error) {
      console.error("Error fetching article:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (liking) return;

    setLiking(true);
    try {
      const response = await fetch(`/api/news/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like" }),
      });

      const result = await response.json();
      if (result.success) {
        setArticle(result.data);
      }
    } catch (error) {
      console.error("Error liking article:", error);
    } finally {
      setLiking(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    if (!bookmarks.includes(article.articleId)) {
      bookmarks.push(article.articleId);
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
      alert("Article bookmarked!");
    } else {
      alert("Already bookmarked!");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-linear-to-br from-gray-950 via-gray-900 to-black text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading article...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex h-screen bg-linear-to-br from-gray-950 via-gray-900 to-black text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
              <p className="text-gray-400 mb-6">
                {error ||
                  "The article you're looking for doesn't exist or has been removed."}
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.back()}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={() => router.push("/news")}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors"
                >
                  Browse News
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt)
    : null;
  const fetchedDate = article.fetchedAt ? new Date(article.fetchedAt) : null;

  return (
    <div className="flex h-screen bg-linear-to-br from-gray-950 via-gray-900 to-black text-white overflow-hidden">
      {/* <Sidebar /> */}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* <Navbar /> */}

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to News</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content - Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Main Article Card */}
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl overflow-hidden"
                >
                  {/* Featured Image */}
                  {article.imageUrl && (
                    <div className="relative h-[500px] bg-gray-800">
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover"
                        priority
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/50 to-transparent" />

                      {/* Floating Category Badge */}
                      <div className="absolute top-6 left-6">
                        <span className="px-4 py-2 bg-blue-500/20 backdrop-blur-xl border border-blue-500/30 rounded-xl text-sm font-semibold text-blue-400 uppercase tracking-wider">
                          {article.category}
                        </span>
                      </div>

                      {/* Quality Indicators */}
                      <div className="absolute top-6 right-6 flex gap-2">
                        {article.score && article.score >= 70 && (
                          <div className="px-3 py-2 bg-green-500/20 backdrop-blur-xl border border-green-500/30 rounded-xl flex items-center gap-2">
                            <Award className="w-4 h-4 text-green-400" />
                            <span className="text-sm font-semibold text-green-400">
                              High Quality
                            </span>
                          </div>
                        )}
                        {article.hotness && article.hotness >= 70 && (
                          <div className="px-3 py-2 bg-orange-500/20 backdrop-blur-xl border border-orange-500/30 rounded-xl flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-orange-400" />
                            <span className="text-sm font-semibold text-orange-400">
                              Trending
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="p-8 space-y-6">
                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                      {article.title}
                    </h1>

                    {/* Meta Information Bar */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 pb-6 border-b border-gray-800">
                      {article.author && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium text-gray-300">
                            {article.author}
                          </span>
                        </div>
                      )}

                      {publishedDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{format(publishedDate, "MMMM dd, yyyy")}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-500">
                            {format(publishedDate, "HH:mm")}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {publishedDate
                            ? formatDistanceToNow(publishedDate, {
                                addSuffix: true,
                              })
                            : "Unknown"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 ml-auto">
                        <ExternalLink className="w-4 h-4" />
                        <span className="font-semibold text-blue-400">
                          {article.source}
                        </span>
                      </div>
                    </div>

                    {/* Full Article Content */}
                    <div className="prose prose-invert prose-lg max-w-none">
                      {/* Lead/Description - Highlighted */}
                      {article.description && (
                        <div className="bg-linear-to-r from-blue-500/5 to-purple-500/5 border-l-4 border-blue-500 p-6 rounded-r-xl mb-8">
                          <p className="text-xl text-gray-200 leading-relaxed font-light italic">
                            {article.description}
                          </p>
                        </div>
                      )}

                      {/* Main Content */}
                      <div className="space-y-6 text-gray-300 leading-relaxed text-lg">
                        {article.content ? (
                          // If full content is available, display it
                          <div className="whitespace-pre-line">
                            {article.content
                              .split("\n\n")
                              .map((paragraph, index) => (
                                <p key={index} className="mb-6">
                                  {paragraph}
                                </p>
                              ))}
                          </div>
                        ) : article.description ? (
                          // If only description is available, show it as content
                          <div>
                            {article.description
                              .split("\n")
                              .map((paragraph, index) => (
                                <p key={index} className="mb-6">
                                  {paragraph}
                                </p>
                              ))}
                          </div>
                        ) : (
                          // Fallback message
                          <div className="text-center py-8 bg-gray-800/30 rounded-xl border border-gray-700/50">
                            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400">
                              Full article content not available. Please visit
                              the original source.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Additional Metadata if available */}
                      {(article.content || article.description) &&
                        article.url && (
                          <div className="mt-8 p-6 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                            <div className="flex items-start gap-4">
                              <div className="p-3 bg-blue-500/10 rounded-lg">
                                <ExternalLink className="w-6 h-6 text-blue-400" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-2">
                                  Read on Original Site
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">
                                  For the full experience including images,
                                  videos, and interactive content, visit the
                                  original article on{" "}
                                  <span className="text-blue-400 font-semibold">
                                    {article.source}
                                  </span>
                                  .
                                </p>
                                <a
                                  href={article.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-lg transition-all font-medium text-sm"
                                >
                                  <span>Visit {article.source}</span>
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Tags Section */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="pt-6 border-t border-gray-800">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Tag className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-400 font-medium">
                            Tags:
                          </span>
                          {article.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-gray-300 hover:bg-gray-800 hover:border-gray-600 transition-all cursor-pointer"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-gray-800">
                      <button
                        onClick={handleLike}
                        disabled={liking}
                        className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50 group"
                      >
                        <Heart className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-red-400">
                          {liking ? "Liking..." : "Like"}
                        </span>
                        <span className="text-sm text-gray-400">
                          ({article.likesCount || 0})
                        </span>
                      </button>

                      <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-500/10 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 transition-all group"
                      >
                        <Share2 className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-blue-400">Share</span>
                      </button>

                      <button
                        onClick={handleBookmark}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-500/10 border border-purple-500/30 rounded-xl hover:bg-purple-500/20 transition-all group"
                      >
                        <BookmarkPlus className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-purple-400">
                          Bookmark
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.article>
              </div>

              {/* Sidebar - Right Column */}
              <div className="lg:col-span-1 space-y-6">
                {/* Stats Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 sticky top-6"
                >
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    Article Statistics
                  </h3>

                  <div className="space-y-4">
                    {/* Views */}
                    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <Eye className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Total Views</p>
                          <p className="text-2xl font-bold">
                            {article.viewsCount || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Likes */}
                    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                          <Heart className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Total Likes</p>
                          <p className="text-2xl font-bold">
                            {article.likesCount || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* AI Generations */}
                    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <Zap className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">
                            AI Generations
                          </p>
                          <p className="text-2xl font-bold">
                            {article.aiGenerationsCount || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    {article.score && (
                      <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/10 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">
                              Quality Score
                            </p>
                            <p className="text-2xl font-bold">
                              {article.score}/100
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Hotness */}
                    {article.hotness && (
                      <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-500/10 rounded-lg">
                            <Sparkles className="w-5 h-5 text-orange-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">
                              Hotness Score
                            </p>
                            <p className="text-2xl font-bold">
                              {article.hotness}/100
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Impact Score */}
                    {article.impactScore && (
                      <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-500/10 rounded-lg">
                            <Award className="w-5 h-5 text-yellow-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">
                              Impact Score
                            </p>
                            <p className="text-2xl font-bold">
                              {article.impactScore}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="pt-4 border-t border-gray-700/50 space-y-3 text-sm">
                      {fetchedDate && (
                        <div>
                          <p className="text-gray-400">Fetched</p>
                          <p className="text-gray-300 font-medium">
                            {format(fetchedDate, "MMM dd, yyyy HH:mm")}
                          </p>
                        </div>
                      )}

                      {article.date && (
                        <div>
                          <p className="text-gray-400">Date</p>
                          <p className="text-gray-300 font-medium">
                            {article.date}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Related Articles Section */}
            {relatedArticles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4 mt-12"
              >
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                  Related Articles
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedArticles.map((related) => (
                    <Link
                      key={related._id}
                      href={`/news/${related.articleId}`}
                      className="group bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl overflow-hidden hover:border-blue-500/30 transition-all"
                    >
                      {related.imageUrl && (
                        <div className="relative h-48 bg-gray-800">
                          <Image
                            src={related.imageUrl}
                            alt={related.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-gray-900 to-transparent" />
                        </div>
                      )}

                      <div className="p-5">
                        <span className="text-xs px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400">
                          {related.category}
                        </span>
                        <h3 className="font-semibold text-base line-clamp-2 mt-3 group-hover:text-blue-400 transition-colors">
                          {related.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                          <span className="font-medium">{related.source}</span>
                          {related.publishedAt && (
                            <>
                              <span>•</span>
                              <span>
                                {format(
                                  new Date(related.publishedAt),
                                  "MMM dd"
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
