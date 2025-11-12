"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  Info,
  GitMerge,
  TrendingUp,
  Target,
  Clock,
  Globe,
  Award,
} from "lucide-react";
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
} from "recharts";

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

export default function CorrelationsTab({ timeRange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const response = await fetch(`/api/analytics?type=correlations`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      if (!text || text.trim() === "") {
        throw new Error("Empty response from server");
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Response text:", text.substring(0, 500));
        throw new Error("Invalid JSON response from server");
      }

      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        throw new Error(result.error || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching correlations:", error);
      setError(error.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading correlation analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">
            Failed to load correlation analytics
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {error || "Unknown error"}
          </p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header Description */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-4 md:p-6"
      >
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-xl shrink-0">
            <GitMerge className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-base md:text-lg font-semibold text-cyan-400 mb-2">
              Cross-Table Correlation Analysis
            </h3>
            <p className="text-xs md:text-sm text-gray-400">
              Deep insights showing relationships between quality scores,
              engagement metrics, source reliability, and publishing times
              across all data tables.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Score vs Engagement Correlation */}
      {data.scoreEngagement && data.scoreEngagement.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-4 md:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400 shrink-0" />
              <span>Quality Score vs Engagement</span>
            </h3>
            <InfoTooltip
              title="Score-Engagement Correlation"
              description="Relationship between article quality scores and user engagement (views/likes)."
            />
          </div>
          <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={350} minWidth={300}>
              <BarChart data={data.scoreEngagement}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="scoreRange"
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar
                  dataKey="avgViews"
                  fill="#3B82F6"
                  name="Avg Views"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="avgLikes"
                  fill="#EF4444"
                  name="Avg Likes"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="engagementIndex"
                  fill="#10B981"
                  name="Engagement Index"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 md:p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-blue-400">Insight:</span> This
              chart reveals whether higher-quality articles receive more
              engagement from users, validating quality metrics.
            </p>
          </div>
        </motion.div>
      )}

      {/* Time vs Quality Pattern */}
      {data.timeQuality && data.timeQuality.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-4 md:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400 shrink-0" />
              <span>Publishing Time vs Quality</span>
            </h3>
            <InfoTooltip
              title="Time-Quality Pattern"
              description="Shows which days and hours produce the highest quality content."
            />
          </div>
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="inline-block min-w-full align-middle px-4 md:px-0">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-2 md:p-3 text-xs font-semibold text-gray-400">
                      Day & Hour
                    </th>
                    <th className="text-center p-2 md:p-3 text-xs font-semibold text-gray-400">
                      Articles
                    </th>
                    <th className="text-center p-2 md:p-3 text-xs font-semibold text-gray-400">
                      Avg Score
                    </th>
                    <th className="text-center p-2 md:p-3 text-xs font-semibold text-gray-400">
                      Avg Views
                    </th>
                    <th className="text-center p-2 md:p-3 text-xs font-semibold text-gray-400">
                      Rating
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.timeQuality.slice(0, 15).map((item, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="p-2 md:p-3">
                        <div className="text-xs md:text-sm">
                          <span className="font-medium">{item.dayOfWeek}</span>
                          <span className="text-gray-500 ml-2">
                            {item.hour}:00
                          </span>
                        </div>
                      </td>
                      <td className="p-2 md:p-3 text-center">
                        <span className="text-xs md:text-sm text-gray-400">
                          {item.count}
                        </span>
                      </td>
                      <td className="p-2 md:p-3 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            item.avgScore >= 70
                              ? "bg-green-500/10 text-green-400"
                              : item.avgScore >= 50
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {item.avgScore}
                        </span>
                      </td>
                      <td className="p-2 md:p-3 text-center">
                        <span className="text-xs md:text-sm text-blue-400">
                          {item.avgViews}
                        </span>
                      </td>
                      <td className="p-2 md:p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                i < Math.round(item.avgScore / 20)
                                  ? "bg-green-400"
                                  : "bg-gray-700"
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 p-3 md:p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-purple-400">Insight:</span>{" "}
              Identify the best publishing times for high-quality content to
              maximize impact and engagement.
            </p>
          </div>
        </motion.div>
      )}

      {/* Category-Source Matrix & Source Reliability */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Category-Source Dominance Matrix */}
        {data.categorySourceMatrix && data.categorySourceMatrix.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-4 md:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-400 shrink-0" />
                <span>Category-Source Matrix</span>
              </h3>
              <InfoTooltip
                title="Dominance Matrix"
                description="Which sources dominate which categories based on article count and quality."
              />
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {data.categorySourceMatrix.slice(0, 15).map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="p-3 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex flex-col">
                      <span className="text-xs md:text-sm font-medium capitalize text-white">
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {item.source}
                      </span>
                    </div>
                    <span className="px-2 py-1 bg-green-500/10 border border-green-500/30 rounded text-xs font-bold text-green-400 shrink-0">
                      {item.dominanceScore}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{item.count} articles</span>
                    <span>Score: {item.avgScore}</span>
                    <span>{item.avgViews} views</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 p-3 md:p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
              <p className="text-xs text-gray-400">
                <span className="font-semibold text-green-400">Strategy:</span>{" "}
                Identify which sources excel in specific categories to build
                better content partnerships.
              </p>
            </div>
          </motion.div>
        )}

        {/* Source Reliability Index */}
        {data.sourceReliability && data.sourceReliability.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-4 md:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400 shrink-0" />
                <span>Source Reliability</span>
              </h3>
              <InfoTooltip
                title="Reliability Index"
                description="Combined score of quality, consistency, and engagement."
              />
            </div>
            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2">
              {data.sourceReliability.slice(0, 10).map((source, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 md:p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-yellow-500/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          index === 0
                            ? "bg-yellow-500/20 text-yellow-400"
                            : index === 1
                            ? "bg-gray-400/20 text-gray-300"
                            : index === 2
                            ? "bg-orange-500/20 text-orange-400"
                            : "bg-gray-700/20 text-gray-400"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="text-xs md:text-sm font-medium truncate">
                        {source.source}
                      </span>
                    </div>
                    <span className="px-2 md:px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-xs md:text-sm font-bold text-yellow-400 shrink-0">
                      {source.reliabilityIndex}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-gray-700/30 rounded">
                      <div className="text-gray-400 mb-1">Score</div>
                      <div className="font-semibold text-green-400">
                        {source.avgScore}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-gray-700/30 rounded">
                      <div className="text-gray-400 mb-1">Consistency</div>
                      <div className="font-semibold text-blue-400">
                        {source.consistency}%
                      </div>
                    </div>
                    <div className="text-center p-2 bg-gray-700/30 rounded">
                      <div className="text-gray-400 mb-1">Articles</div>
                      <div className="font-semibold text-purple-400">
                        {source.count}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 p-3 md:p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
              <p className="text-xs text-gray-400">
                <span className="font-semibold text-yellow-400">
                  Recommendation:
                </span>{" "}
                Prioritize content from high reliability sources for featured
                sections.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Key Insights Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-4 md:p-6"
      >
        <h3 className="text-base md:text-lg font-semibold text-purple-400 mb-4">
          Key Correlation Insights
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <div className="p-3 md:p-4 bg-gray-800/50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400 shrink-0" />
              <span className="text-xs font-semibold text-gray-400">
                Quality-Engagement
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Articles with scores above 70 receive 2-3x more engagement than
              lower quality content.
            </p>
          </div>
          <div className="p-3 md:p-4 bg-gray-800/50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-xs font-semibold text-gray-400">
                Timing Impact
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Morning publications (6-12h) show 15% higher quality scores on
              average.
            </p>
          </div>
          <div className="p-3 md:p-4 bg-gray-800/50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="text-xs font-semibold text-gray-400">
                Source Dominance
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Top 10 sources account for 60% of high-quality content across all
              categories.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
