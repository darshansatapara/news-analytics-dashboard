"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Pagination from "@/components/ui/Pagination";
import {
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  TrendingUp,
  BarChart3,
  Filter,
  Download,
  X,
  SlidersHorizontal,
  Clock,
  Globe,
  Package,
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function GNewsLogsPage() {
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    category: "",
    hasError: "",
    dateFrom: "",
    dateTo: "",
    country: "",
  });
  const [pagination, setPagination] = useState(null);

  // ✅ FIX: Fetch logs whenever any filter changes
  useEffect(() => {
    fetchLogs();
  }, [filters]); // Changed from [filters.page, filters.limit] to [filters]

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/logs/gnews?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setLogs(result.data.logs);
        setPagination(result.data.pagination);
        setAnalytics(result.data.analytics);
      }
    } catch (error) {
      console.error("Error fetching GNews logs:", error);
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

  // Keep applyFilters but it's now just a manual trigger
  const applyFilters = () => {
    // This will trigger useEffect automatically
    setFilters((prev) => ({ ...prev }));
  };

  const clearAllFilters = () => {
    setFilters({
      page: 1,
      limit: 50,
      category: "",
      hasError: "",
      dateFrom: "",
      dateTo: "",
      country: "",
    });
  };

  const exportLogs = () => {
    const csv = [
      ["Timestamp", "Category", "Country", "Articles", "Status", "Error"].join(
        ","
      ),
      ...logs.map((log) =>
        [
          format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss"),
          log.category,
          log.country || "N/A",
          log.articles_count,
          log.error ? "Failed" : "Success",
          (log.error || "").replace(/,/g, ";"),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gnews-logs-${Date.now()}.csv`;
    a.click();
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && !["page", "limit"].includes(key)
  ).length;

  return (
    <div className="flex h-screen bg-linear-to-br from-gray-950 via-gray-900 to-black text-white overflow-hidden">
      {/* <Sidebar /> */}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* <Navbar /> */}

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  GNews API Logs
                </h1>
                <p className="text-gray-400 mt-1">
                  Monitor and analyze GNews API fetch operations
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
                    <span className="px-2 py-0.5 bg-blue-500 rounded-full text-xs">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={exportLogs}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-xl hover:bg-green-500/20 transition-all"
                >
                  <Download className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium">Export CSV</span>
                </button>
              </div>
            </div>

            {/* Analytics Cards */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                      <Activity className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Total Requests</p>
                      <p className="text-2xl font-bold">
                        {analytics.totalRequests}
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
                    <div className="p-3 bg-green-500/10 rounded-xl">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Success Rate</p>
                      <p className="text-2xl font-bold text-green-400">
                        {analytics.successRate}%
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
                    <div className="p-3 bg-red-500/10 rounded-xl">
                      <XCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Failed</p>
                      <p className="text-2xl font-bold text-red-400">
                        {analytics.failed}
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
                      <TrendingUp className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Articles</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {analytics.totalArticlesFetched}
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
                    <div className="p-3 bg-orange-500/10 rounded-xl">
                      <Package className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Avg/Request</p>
                      <p className="text-2xl font-bold text-orange-400">
                        {(
                          analytics.totalArticlesFetched /
                          analytics.totalRequests
                        ).toFixed(1)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Timeline Chart */}
            {analytics &&
              analytics.timeline &&
              analytics.timeline.length > 0 && (
                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    Request Timeline (Last 30 Days)
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.timeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="_id"
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
                      />
                      <Legend wrapperStyle={{ color: "#9CA3AF" }} />
                      <Line
                        type="monotone"
                        dataKey="requests"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        name="Requests"
                      />
                      <Line
                        type="monotone"
                        dataKey="articles"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="Articles"
                      />
                      <Line
                        type="monotone"
                        dataKey="errors"
                        stroke="#EF4444"
                        strokeWidth={2}
                        name="Errors"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

            {/* Category & Country Breakdown */}
            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Chart */}
                {analytics.byCategory && analytics.byCategory.length > 0 && (
                  <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      Articles by Category
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.byCategory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="_id"
                          stroke="#9CA3AF"
                          tick={{ fill: "#9CA3AF", fontSize: 11 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                        />
                        <Bar
                          dataKey="totalArticles"
                          fill="#3B82F6"
                          radius={[8, 8, 0, 0]}
                          name="Articles"
                        />
                        <Bar
                          dataKey="errors"
                          fill="#EF4444"
                          radius={[8, 8, 0, 0]}
                          name="Errors"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Country Chart */}
                {analytics.byCountry && analytics.byCountry.length > 0 && (
                  <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-green-400" />
                      Articles by Country
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.byCountry}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="_id"
                          stroke="#9CA3AF"
                          tick={{ fill: "#9CA3AF" }}
                        />
                        <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                        />
                        <Bar
                          dataKey="totalArticles"
                          fill="#10B981"
                          radius={[8, 8, 0, 0]}
                          name="Articles"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="w-5 h-5 text-blue-400" />
                    Filter Logs
                  </h3>
                  <button
                    onClick={() => setShowAdvancedFilters(false)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => updateFilter("category", e.target.value)}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="">All Categories</option>
                      <option value="business">Business</option>
                      <option value="technology">Technology</option>
                      <option value="politics">Politics</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="sports">Sports</option>
                      <option value="science">Science</option>
                      <option value="health">Health</option>
                      <option value="general">General</option>
                    </select>
                  </div>

                  {/* Country Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Country
                    </label>
                    <select
                      value={filters.country}
                      onChange={(e) => updateFilter("country", e.target.value)}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="">All Countries</option>
                      <option value="in">India (IN)</option>
                      <option value="us">United States (US)</option>
                      <option value="jp">Japan (JP)</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Status
                    </label>
                    <select
                      value={filters.hasError}
                      onChange={(e) => updateFilter("hasError", e.target.value)}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="">All Status</option>
                      <option value="false">Success Only</option>
                      <option value="true">Errors Only</option>
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
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="25">25 logs</option>
                      <option value="50">50 logs</option>
                      <option value="100">100 logs</option>
                      <option value="200">200 logs</option>
                    </select>
                  </div>

                  {/* Date From */}
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

                  {/* Date To */}
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
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={applyFilters}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium transition-colors"
                  >
                    Apply Filters
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
                    <button
                      onClick={() => {
                        updateFilter("category", "");
                        setTimeout(applyFilters, 100);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.country && (
                  <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-lg text-sm flex items-center gap-2">
                    Country: {filters.country.toUpperCase()}
                    <button
                      onClick={() => {
                        updateFilter("country", "");
                        setTimeout(applyFilters, 100);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.hasError && (
                  <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-lg text-sm flex items-center gap-2">
                    Status: {filters.hasError === "true" ? "Errors" : "Success"}
                    <button
                      onClick={() => {
                        updateFilter("hasError", "");
                        setTimeout(applyFilters, 100);
                      }}
                    >
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
                  of {pagination.total} logs
                </span>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
              </div>
            )}

            {/* Logs Table */}
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left p-4 text-sm font-semibold text-gray-400">
                        Timestamp
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-400">
                        Category
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-400">
                        Country
                      </th>
                      <th className="text-center p-4 text-sm font-semibold text-gray-400">
                        Articles
                      </th>
                      <th className="text-center p-4 text-sm font-semibold text-gray-400">
                        Status
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-400">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center">
                          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </td>
                      </tr>
                    ) : logs.length > 0 ? (
                      logs.map((log, index) => (
                        <motion.tr
                          key={log._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.02 }}
                          className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">
                                {format(
                                  new Date(log.timestamp),
                                  "MMM dd, yyyy HH:mm:ss"
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs font-medium text-blue-400 capitalize">
                              {log.category}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="uppercase text-sm font-semibold">
                              {log.country || "N/A"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="text-lg font-bold">
                              {log.articles_count}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {log.error ? (
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <XCircle className="w-4 h-4 text-red-400" />
                                <span className="text-xs font-medium text-red-400">
                                  Failed
                                </span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-lg">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-xs font-medium text-green-400">
                                  Success
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            {log.error ? (
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                                <span className="text-xs text-gray-400 line-clamp-2">
                                  {log.error}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">-</span>
                            )}
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="p-8 text-center text-gray-400"
                        >
                          No logs found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
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
