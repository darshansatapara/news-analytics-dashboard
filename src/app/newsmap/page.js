"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Pagination from "@/components/ui/Pagination";
import {
  Layers,
  Copy,
  TrendingUp,
  BarChart3,
  Filter,
  Download,
  X,
  SlidersHorizontal,
  Clock,
  AlertCircle,
  ExternalLink,
  Eye,
  Calendar,
  Percent,
  Target,
  Globe,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import Image from "next/image";
import Link from "next/link";

const COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#06B6D4",
  "#6366F1",
];

export default function NewsMapPage() {
  const [newsmap, setNewsmap] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    minDuplicates: 2,
    sortBy: "count",
    sortOrder: "desc",
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchNewsMap();
  }, [filters]);

  const fetchNewsMap = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/newsmap?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setNewsmap(result.data.newsmap);
        setPagination(result.data.pagination);
        setStats(result.data.stats);
      }
    } catch (error) {
      console.error("Error fetching newsmap:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      minDuplicates: 2,
      sortBy: "count",
      sortOrder: "desc",
    });
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const exportData = () => {
    const csv = [
      [
        "Hash",
        "Title",
        "Duplicate Count",
        "Sources",
        "First Seen",
        "Last Seen",
      ].join(","),
      ...newsmap.map((group) =>
        [
          group.contentHash,
          `"${group.articles?.[0]?.title?.replace(/"/g, '""') || "Unknown"}"`,
          group.count,
          group.sources.join("; "),
          format(new Date(group.firstSeen), "yyyy-MM-dd HH:mm:ss"),
          format(new Date(group.lastSeen), "yyyy-MM-dd HH:mm:ss"),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsmap-duplicates-${Date.now()}.csv`;
    a.click();
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) =>
      value &&
      !["page", "limit", "sortBy", "sortOrder"].includes(key) &&
      !(key === "minDuplicates" && value === 2)
  ).length;

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white overflow-hidden">
      {/* <Sidebar /> */}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* <Navbar /> */}

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
                  News Map - Duplicate Detection
                </h1>
                <p className="text-gray-400 mt-1">
                  Analyze duplicate articles and content clustering across
                  sources
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-800 transition-all"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="px-2 py-0.5 bg-orange-500 rounded-full text-xs">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={exportData}
                  disabled={newsmap.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-xl hover:bg-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium">Export CSV</span>
                </button>
              </div>
            </div>

            {/* Enhanced Stats Cards */}
            {stats && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-orange-500/10 rounded-xl">
                        <Layers className="w-6 h-6 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Total Groups</p>
                        <p className="text-2xl font-bold">
                          {stats.totalGroups?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-red-500/10 rounded-xl">
                        <Copy className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">
                          Total Duplicates
                        </p>
                        <p className="text-2xl font-bold text-red-400">
                          {stats.totalDuplicates?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-500/10 rounded-xl">
                        <TrendingUp className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Avg Per Group</p>
                        <p className="text-2xl font-bold text-blue-400">
                          {stats.avgDuplicatesPerGroup?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-500/10 rounded-xl">
                        <BarChart3 className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Max Duplicates</p>
                        <p className="text-2xl font-bold text-purple-400">
                          {stats.maxDuplicates}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-500/10 rounded-xl">
                        <Target className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Duplicate Rate</p>
                        <p className="text-2xl font-bold text-green-400">
                          {stats.duplicateRate
                            ? `${stats.duplicateRate}%`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Distribution & Top Sources Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Duplicate Distribution Chart */}
                  {stats.distribution && stats.distribution.length > 0 && (
                    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-orange-400" />
                        Duplicate Distribution
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.distribution}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#374151"
                          />
                          <XAxis
                            dataKey="range"
                            stroke="#9CA3AF"
                            tick={{ fill: "#9CA3AF", fontSize: 12 }}
                          />
                          <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1F2937",
                              border: "1px solid #374151",
                              borderRadius: "8px",
                              color: "#fff",
                            }}
                            labelStyle={{ color: "#F59E0B" }}
                          />
                          <Bar
                            dataKey="groupCount"
                            fill="#F59E0B"
                            radius={[8, 8, 0, 0]}
                            name="Groups"
                          />
                          <Bar
                            dataKey="totalArticles"
                            fill="#EF4444"
                            radius={[8, 8, 0, 0]}
                            name="Articles"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Top Sources with Duplicates */}
                  {stats.topSources && stats.topSources.length > 0 && (
                    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-400" />
                        Top Duplicate Sources
                      </h3>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                        {stats.topSources.map((source, index) => (
                          <div
                            key={index}
                            className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm truncate flex-1">
                                {source._id}
                              </span>
                              <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-lg text-xs font-semibold text-orange-400 ml-2">
                                {source.duplicateCount} groups
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <span>{source.totalArticles} total articles</span>
                              <div className="h-1.5 flex-1 bg-gray-700 rounded-full overflow-hidden mx-3">
                                <div
                                  className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                                  style={{
                                    width: `${
                                      (source.totalArticles /
                                        stats.totalDuplicates) *
                                      100
                                    }%`,
                                  }}
                                />
                              </div>
                              <span className="font-semibold">
                                {(
                                  (source.totalArticles /
                                    stats.totalDuplicates) *
                                  100
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Time Analysis */}
                {stats.timeAnalysis && (
                  <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-400" />
                      Time Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-5 bg-gray-800/30 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-purple-500/10 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">
                              Avg Time Between Duplicates
                            </p>
                            <p className="text-xl font-bold text-purple-400">
                              {stats.timeAnalysis.avgTimeDiffHours} hours
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Average time between first and last occurrence of
                          duplicate content
                        </p>
                      </div>

                      <div className="p-5 bg-gray-800/30 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-red-500/10 rounded-lg">
                            <Clock className="w-5 h-5 text-red-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">
                              Max Time Spread
                            </p>
                            <p className="text-xl font-bold text-red-400">
                              {stats.timeAnalysis.maxTimeDiffHours} hours
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Maximum time spread for duplicate content across
                          sources
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="w-5 h-5 text-orange-400" />
                    Filter Duplicate Groups
                  </h3>
                  <button
                    onClick={() => setShowAdvancedFilters(false)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Min Duplicates */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Minimum Duplicates
                    </label>
                    <input
                      type="number"
                      min="2"
                      value={filters.minDuplicates}
                      onChange={(e) =>
                        updateFilter("minDuplicates", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => updateFilter("sortBy", e.target.value)}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    >
                      <option value="count">Duplicate Count</option>
                      <option value="lastSeen">Last Seen</option>
                      <option value="firstSeen">First Seen</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Sort Order
                    </label>
                    <select
                      value={filters.sortOrder}
                      onChange={(e) =>
                        updateFilter("sortOrder", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    >
                      <option value="desc">Highest First</option>
                      <option value="asc">Lowest First</option>
                    </select>
                  </div>

                  {/* Items Per Page */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Per Page
                    </label>
                    <select
                      value={filters.limit}
                      onChange={(e) => updateFilter("limit", e.target.value)}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    >
                      <option value="10">10 groups</option>
                      <option value="20">20 groups</option>
                      <option value="50">50 groups</option>
                      <option value="100">100 groups</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-400">Active filters:</span>
                {filters.minDuplicates > 2 && (
                  <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-lg text-sm flex items-center gap-2">
                    Min Duplicates: {filters.minDuplicates}
                    <button onClick={() => updateFilter("minDuplicates", 2)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Results Count */}
            {pagination && (
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>
                  Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total} groups
                </span>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
              </div>
            )}

            {/* NewsMap Groups */}
            {loading ? (
              <div className="grid grid-cols-1 gap-6">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-800/30 rounded-2xl h-48"
                  />
                ))}
              </div>
            ) : newsmap.length > 0 ? (
              <div className="space-y-6">
                {newsmap.map((group, index) => {
                  const timeDiff =
                    new Date(group.lastSeen) - new Date(group.firstSeen);
                  const hoursDiff = (timeDiff / (1000 * 60 * 60)).toFixed(1);

                  return (
                    <motion.div
                      key={group._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl overflow-hidden hover:border-orange-500/30 transition-all"
                    >
                      {/* Group Header */}
                      <div className="p-6 border-b border-gray-800">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              <span className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-sm font-bold text-red-400 flex items-center gap-2">
                                <Copy className="w-4 h-4" />
                                {group.count} Duplicates
                              </span>
                              <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-blue-400">
                                {group.sources?.length || 0} Sources
                              </span>
                              {hoursDiff > 0 && (
                                <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-lg text-xs text-purple-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Spread: {hoursDiff}h
                                </span>
                              )}
                            </div>

                            <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                              {group.articles?.[0]?.title || "Unknown Title"}
                            </h3>

                            <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                First:{" "}
                                {format(
                                  new Date(group.firstSeen),
                                  "MMM dd, HH:mm"
                                )}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Last:{" "}
                                {format(
                                  new Date(group.lastSeen),
                                  "MMM dd, HH:mm"
                                )}
                              </span>
                              <span className="text-gray-500">
                                (
                                {formatDistanceToNow(new Date(group.lastSeen), {
                                  addSuffix: true,
                                })}
                                )
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleGroup(group._id)}
                            className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium whitespace-nowrap"
                          >
                            {expandedGroups[group._id]
                              ? "Hide Details"
                              : "Show Details"}
                          </button>
                        </div>

                        {/* Sources Tags */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {group.sources?.map((source, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-lg text-xs text-purple-400"
                            >
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Expanded Articles List */}
                      {expandedGroups[group._id] && group.articles && (
                        <div className="p-6 bg-gray-800/20">
                          <h4 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            All {group.count} Duplicate Articles
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {group.articles.map((article, idx) => (
                              <Link
                                key={article._id}
                                href={`/news/${article.articleId}`}
                                className="group p-4 bg-gray-900/50 border border-gray-700/50 rounded-xl hover:border-blue-500/30 transition-all"
                              >
                                <div className="flex gap-4">
                                  {article.imageUrl && (
                                    <div className="relative w-20 h-20 flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden">
                                      <Image
                                        src={article.imageUrl}
                                        alt={article.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                        onError={(e) => {
                                          e.target.style.display = "none";
                                        }}
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h5 className="text-sm font-medium line-clamp-2 group-hover:text-blue-400 transition-colors mb-2">
                                      {article.title}
                                    </h5>
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                      <span className="font-medium">
                                        {article.source}
                                      </span>
                                      {article.publishedAt && (
                                        <>
                                          <span>•</span>
                                          <span>
                                            {format(
                                              new Date(article.publishedAt),
                                              "MMM dd, HH:mm"
                                            )}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                    {article.category && (
                                      <span className="inline-block mt-2 px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-400">
                                        {article.category}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-4">
                  No duplicate groups found
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Try adjusting your filters or check back later
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-2 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-400 hover:bg-orange-500/20 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(page) => updateFilter("page", page)}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
