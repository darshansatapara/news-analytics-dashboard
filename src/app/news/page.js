"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import NewsCard from "@/components/news/NewsCard";
import Pagination from "@/components/ui/Pagination";
import {
  Search,
  AlertCircle,
  Filter,
  X,
  Calendar,
  SlidersHorizontal,
} from "lucide-react";

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    category: "",
    source: "",
    search: "",
    dateFrom: "",
    dateTo: "",
    sortBy: "publishedAt",
    sortOrder: "desc",
    minScore: "",
    maxScore: "",
    minHotness: "",
    maxHotness: "",
  });
  const [pagination, setPagination] = useState(null);
  const [availableFilters, setAvailableFilters] = useState({
    categories: [],
    sources: [],
  });

  // ✅ FIX: Watch all filter changes for proper pagination
  useEffect(() => {
    fetchNews();
  }, [filters]); // Changed to watch entire filters object

  const fetchNews = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      console.log("Fetching news with params:", params.toString());

      const response = await fetch(`/api/news?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      console.log("News API Response:", result);

      if (result.success) {
        setNews(result.data.articles);
        setPagination(result.data.pagination);
        setAvailableFilters(result.data.filters);
      } else {
        throw new Error(result.error || "Failed to fetch news");
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Update filter function - reset page to 1 only when not changing page
  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1, // Keep page number when paginating
    }));
  };

  const applyFilters = () => {
    // This will trigger useEffect automatically
    setFilters((prev) => ({ ...prev }));
  };

  const clearAllFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      category: "",
      source: "",
      search: "",
      dateFrom: "",
      dateTo: "",
      sortBy: "publishedAt",
      sortOrder: "desc",
      minScore: "",
      maxScore: "",
      minHotness: "",
      maxHotness: "",
    });
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) =>
      value && !["page", "limit", "sortBy", "sortOrder"].includes(key)
  ).length;

  return (
    <div className="flex h-screen bg-linear-to-br from-gray-950 via-gray-900 to-black text-white overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  News Articles
                </h1>
                <p className="text-gray-400 mt-1">
                  Browse and search through all fetched news articles
                </p>
              </div>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-800 transition-all"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Advanced Filters</span>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 bg-blue-500 rounded-full text-xs">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && applyFilters()}
                placeholder="Search articles by title, description, or source..."
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>

            {/* Basic Filters Row */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Category Filter */}
              <select
                value={filters.category}
                onChange={(e) => updateFilter("category", e.target.value)}
                className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">All Categories</option>
                {availableFilters.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Source Filter */}
              <select
                value={filters.source}
                onChange={(e) => updateFilter("source", e.target.value)}
                className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">All Sources</option>
                {availableFilters.sources.slice(0, 100).map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter("sortBy", e.target.value)}
                className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="publishedAt">Published Date</option>
                <option value="score">Score</option>
                <option value="hotness">Hotness</option>
                <option value="viewsCount">Views</option>
                <option value="likesCount">Likes</option>
                <option value="fetchedAt">Fetched Date</option>
              </select>

              {/* Sort Order */}
              <button
                onClick={() =>
                  updateFilter(
                    "sortOrder",
                    filters.sortOrder === "asc" ? "desc" : "asc"
                  )
                }
                className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm hover:bg-gray-800 transition-colors"
              >
                {filters.sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
              </button>

              {/* Items per page */}
              <select
                value={filters.limit}
                onChange={(e) => updateFilter("limit", e.target.value)}
                className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="12">12 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear All ({activeFilterCount})
                </button>
              )}

              {/* Apply Button for Search */}
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl text-sm font-medium transition-colors"
              >
                Apply Filters
              </button>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="w-5 h-5 text-blue-400" />
                    Advanced Filters
                  </h3>
                  <button
                    onClick={() => setShowAdvancedFilters(false)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Date From
                    </label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => updateFilter("dateFrom", e.target.value)}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Date To
                    </label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => updateFilter("dateTo", e.target.value)}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  {/* Score Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Min Score (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={filters.minScore}
                      onChange={(e) => updateFilter("minScore", e.target.value)}
                      placeholder="e.g., 50"
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Max Score (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={filters.maxScore}
                      onChange={(e) => updateFilter("maxScore", e.target.value)}
                      placeholder="e.g., 100"
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  {/* Hotness Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Min Hotness (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={filters.minHotness}
                      onChange={(e) =>
                        updateFilter("minHotness", e.target.value)
                      }
                      placeholder="e.g., 60"
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Max Hotness (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={filters.maxHotness}
                      onChange={(e) =>
                        updateFilter("maxHotness", e.target.value)
                      }
                      placeholder="e.g., 100"
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                {/* Apply Advanced Filters */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={applyFilters}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium transition-colors"
                  >
                    Apply Advanced Filters
                  </button>
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors"
                  >
                    Reset All
                  </button>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-400">Active filters:</span>
                {filters.category && (
                  <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm flex items-center gap-2">
                    Category: {filters.category}
                    <button onClick={() => updateFilter("category", "")}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.source && (
                  <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-lg text-sm flex items-center gap-2">
                    Source: {filters.source}
                    <button onClick={() => updateFilter("source", "")}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.search && (
                  <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-lg text-sm flex items-center gap-2">
                    Search: "{filters.search}"
                    <button onClick={() => updateFilter("search", "")}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(filters.dateFrom || filters.dateTo) && (
                  <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-lg text-sm flex items-center gap-2">
                    Date Range
                    <button
                      onClick={() => {
                        updateFilter("dateFrom", "");
                        updateFilter("dateTo", "");
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-400">
                    Error Loading News
                  </h3>
                  <p className="text-sm text-red-300 mt-1">{error}</p>
                  <button
                    onClick={fetchNews}
                    className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Results Count */}
            {pagination && !error && (
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>
                  Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total} articles
                </span>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
              </div>
            )}

            {/* News Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(parseInt(filters.limit) || 12)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-800/30 rounded-2xl h-96"
                  />
                ))}
              </div>
            ) : !error && news.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {news.map((article) => (
                    <NewsCard key={article._id} article={article} />
                  ))}
                </div>

                {/* Pagination - ✅ NOW WORKS! */}
                {pagination && pagination.totalPages > 1 && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(page) => updateFilter("page", page)}
                  />
                )}
              </>
            ) : !error ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg mb-4">No articles found</p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 hover:bg-blue-500/20 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
