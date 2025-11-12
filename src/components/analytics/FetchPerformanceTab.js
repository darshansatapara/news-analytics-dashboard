"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  Info,
  Zap,
  CheckCircle,
  XCircle,
  TrendingUp,
  Activity,
} from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#10B981", "#EF4444", "#3B82F6", "#F59E0B"];

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

export default function FetchPerformanceTab({ timeRange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?type=fetch-performance`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Error fetching performance:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading fetch performance...</p>
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
      {/* Overall Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <InfoTooltip
              title="Overall Success Rate"
              description="Combined success rate across GNews API and RSS Feeds."
            />
          </div>
          <p className="text-xs text-gray-400 mb-1">Overall Success Rate</p>
          <p className="text-3xl font-bold text-green-400">
            {data.overallSuccessRate}%
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Across all fetch operations
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <InfoTooltip
              title="GNews Performance"
              description="GNews API success rate and article fetch statistics."
            />
          </div>
          <p className="text-xs text-gray-400 mb-1">GNews API</p>
          <p className="text-3xl font-bold text-blue-400">
            {data.gnews.successRate}%
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {data.gnews.totalArticles?.toLocaleString()} articles fetched
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
            <InfoTooltip
              title="RSS Performance"
              description="RSS Feeds success rate and article fetch statistics."
            />
          </div>
          <p className="text-xs text-gray-400 mb-1">RSS Feeds</p>
          <p className="text-3xl font-bold text-purple-400">
            {data.rss.successRate}%
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {data.rss.totalArticles?.toLocaleString()} articles fetched
          </p>
        </motion.div>
      </div>

      {/* Detailed Stats Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GNews Detailed Stats */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              GNews API Statistics
            </h3>
            <InfoTooltip
              title="GNews Stats"
              description="Comprehensive statistics for GNews API fetch operations."
            />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Total Requests</p>
                <p className="text-2xl font-bold text-blue-400">
                  {data.gnews.total}
                </p>
              </div>
              <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Successful</p>
                <p className="text-2xl font-bold text-green-400">
                  {data.gnews.successful}
                </p>
              </div>
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-400">
                  {data.gnews.failed}
                </p>
              </div>
              <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Avg/Request</p>
                <p className="text-2xl font-bold text-purple-400">
                  {data.gnews.avgArticlesPerRequest}
                </p>
              </div>
            </div>

            {/* Success Rate Visual */}
            <div className="p-4 bg-gray-800/30 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Success Rate</span>
                <span className="text-lg font-bold text-blue-400">
                  {data.gnews.successRate}%
                </span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  style={{ width: `${data.gnews.successRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RSS Detailed Stats */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              RSS Feeds Statistics
            </h3>
            <InfoTooltip
              title="RSS Stats"
              description="Comprehensive statistics for RSS feed fetch operations."
            />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Total Requests</p>
                <p className="text-2xl font-bold text-purple-400">
                  {data.rss.total}
                </p>
              </div>
              <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Successful</p>
                <p className="text-2xl font-bold text-green-400">
                  {data.rss.successful}
                </p>
              </div>
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-400">
                  {data.rss.failed}
                </p>
              </div>
              <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Avg/Request</p>
                <p className="text-2xl font-bold text-orange-400">
                  {data.rss.avgArticlesPerRequest}
                </p>
              </div>
            </div>

            {/* Success Rate Visual */}
            <div className="p-4 bg-gray-800/30 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Success Rate</span>
                <span className="text-lg font-bold text-purple-400">
                  {data.rss.successRate}%
                </span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${data.rss.successRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GNews by Category */}
        {data.gnewsByCategory && data.gnewsByCategory.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">GNews by Category</h3>
              <InfoTooltip
                title="GNews Categories"
                description="Success rates and article counts per category for GNews API."
              />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.gnewsByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="category"
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
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
                  }}
                />
                <Legend />
                <Bar
                  dataKey="totalArticles"
                  fill="#3B82F6"
                  name="Articles"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="successRate"
                  fill="#10B981"
                  name="Success Rate %"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* RSS by Category */}
        {data.rssByCategory && data.rssByCategory.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">RSS by Category</h3>
              <InfoTooltip
                title="RSS Categories"
                description="Success rates and article counts per category for RSS Feeds."
              />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.rssByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="category"
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
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
                  }}
                />
                <Legend />
                <Bar
                  dataKey="totalArticles"
                  fill="#8B5CF6"
                  name="Articles"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="successRate"
                  fill="#10B981"
                  name="Success Rate %"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Reliability Trend */}
      {data.reliabilityTrend && data.reliabilityTrend.length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Reliability Trend (Last 7 Days)
            </h3>
            <InfoTooltip
              title="Reliability Trend"
              description="Daily success rates for both GNews and RSS over the past week."
            />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.reliabilityTrend}>
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
                dataKey="successRate"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Success Rate %"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
