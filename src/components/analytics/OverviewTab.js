"use client";

import { useState, useEffect } from "react";
import {
  Database,
  Globe,
  TrendingUp,
  Eye,
  Heart,
  Zap,
  AlertCircle,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

const InfoTooltip = ({ title, description }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="p-1 hover:bg-gray-700 rounded-full transition-colors"
      >
        <Info className="w-4 h-4 text-gray-400" />
      </button>

      {show && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-gray-800 border border-gray-700 rounded-xl shadow-xl">
          <div className="text-xs font-semibold text-white mb-1">{title}</div>
          <div className="text-xs text-gray-400">{description}</div>
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export default function OverviewTab({ timeRange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/analytics?type=overview&range=${timeRange}`
      );
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Error fetching overview:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading overview analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-400">Failed to load analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Database className="w-6 h-6 text-blue-400" />
            </div>
            <InfoTooltip
              title="Total Articles"
              description="Total number of articles fetched across all sources in the selected time period."
            />
          </div>
          <p className="text-xs text-gray-400 mb-1">Total Articles</p>
          <p className="text-3xl font-bold">
            {data.overview.totalArticles.toLocaleString()}
          </p>
          {data.overview.articlesTrend !== undefined && (
            <div
              className={`flex items-center gap-1 mt-2 text-xs ${
                data.overview.articlesTrend >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>
                {data.overview.articlesTrend >= 0 ? "+" : ""}
                {data.overview.articlesTrend}% vs previous
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Globe className="w-6 h-6 text-purple-400" />
            </div>
            <InfoTooltip
              title="Unique Sources"
              description="Number of distinct news sources publishing content."
            />
          </div>
          <p className="text-xs text-gray-400 mb-1">Unique Sources</p>
          <p className="text-3xl font-bold text-purple-400">
            {data.overview.totalSources}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Eye className="w-6 h-6 text-blue-400" />
            </div>
            <InfoTooltip
              title="Total Views"
              description="Cumulative views across all articles."
            />
          </div>
          <p className="text-xs text-gray-400 mb-1">Total Views</p>
          <p className="text-3xl font-bold text-blue-400">
            {data.engagement.totalViews.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Avg: {data.engagement.avgViewsPerArticle} per article
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-red-500/10 rounded-xl">
              <Heart className="w-6 h-6 text-red-400" />
            </div>
            <InfoTooltip
              title="Engagement Rate"
              description="Percentage of views that result in likes."
            />
          </div>
          <p className="text-xs text-gray-400 mb-1">Engagement Rate</p>
          <p className="text-3xl font-bold text-red-400">
            {data.engagement.engagementRate}%
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {data.engagement.totalLikes.toLocaleString()} total likes
          </p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        {data.categoryDistribution && data.categoryDistribution.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Category Distribution</h3>
              <InfoTooltip
                title="Category Distribution"
                description="Distribution of articles across different news categories."
              />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.categoryDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Hourly Pattern */}
        {data.hourlyPattern && data.hourlyPattern.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Hourly Publishing Pattern
              </h3>
              <InfoTooltip
                title="Hourly Pattern"
                description="Distribution of articles by hour of day (UTC)."
              />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.hourlyPattern}>
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
                  }}
                />
                <Bar dataKey="count" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Daily Trend */}
      {data.dailyTrend && data.dailyTrend.length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Daily Article Trend</h3>
            <InfoTooltip
              title="Daily Trend"
              description="Daily article count and average quality score over the last 30 days."
            />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
              />
              <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Articles"
              />
              <Line
                type="monotone"
                dataKey="avgScore"
                stroke="#10B981"
                strokeWidth={2}
                name="Avg Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
