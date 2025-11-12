"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  Info,
  Copy,
  Layers,
  Clock,
  TrendingUp,
  Eye,
  Globe,
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
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import Link from "next/link";

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

export default function DuplicatesTab({ timeRange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?type=duplicates`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Error fetching duplicates:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading duplicate analytics...</p>
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
      {/* Overall Duplicate Stats */}
      {data.overall && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <Layers className="w-6 h-6 text-orange-400" />
              </div>
              <InfoTooltip
                title="Total Groups"
                description="Number of distinct content groups with duplicate articles."
              />
            </div>
            <p className="text-xs text-gray-400 mb-1">Total Groups</p>
            <p className="text-3xl font-bold text-orange-400">
              {data.overall.totalGroups?.toLocaleString()}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <Copy className="w-6 h-6 text-red-400" />
              </div>
              <InfoTooltip
                title="Total Duplicates"
                description="Total number of duplicate articles across all groups."
              />
            </div>
            <p className="text-xs text-gray-400 mb-1">Total Duplicates</p>
            <p className="text-3xl font-bold text-red-400">
              {data.overall.totalDuplicates?.toLocaleString()}
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
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <InfoTooltip
                title="Average Duplicates"
                description="Average number of duplicates per content group."
              />
            </div>
            <p className="text-xs text-gray-400 mb-1">Avg Per Group</p>
            <p className="text-3xl font-bold text-blue-400">
              {data?.overall.avgDuplicatesPerGroup.toFixed(2)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <Eye className="w-6 h-6 text-purple-400" />
              </div>
              <InfoTooltip
                title="Max Duplicates"
                description="Highest number of duplicates found for a single story."
              />
            </div>
            <p className="text-xs text-gray-400 mb-1">Max Duplicates</p>
            <p className="text-3xl font-bold text-purple-400">
              {data.overall.maxDuplicates}
            </p>
          </motion.div>
        </div>
      )}

      {/* Most Duplicated Content */}
      {data.mostDuplicated && data.mostDuplicated.length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Copy className="w-5 h-5 text-orange-400" />
              Most Duplicated Stories
            </h3>
            <InfoTooltip
              title="Viral Stories"
              description="Stories with the highest number of duplicate articles across sources."
            />
          </div>
          <div className="space-y-3">
            {data.mostDuplicated.slice(0, 10).map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-orange-500/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
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

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium line-clamp-2 mb-2">
                      {item.title || "Untitled"}
                    </h4>

                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="px-2 py-1 bg-red-500/10 border border-red-500/30 rounded text-xs font-semibold text-red-400">
                        {item.duplicateCount} duplicates
                      </span>
                      <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-400">
                        {item.sourceCount} sources
                      </span>
                      {item.category && (
                        <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded text-xs text-purple-400 capitalize">
                          {item.category}
                        </span>
                      )}
                      {item.viralityIndex && (
                        <span className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400">
                          Virality: {item.viralityIndex}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {item.sources?.slice(0, 5).map((source, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-700/50 rounded text-xs text-gray-400"
                        >
                          {source}
                        </span>
                      ))}
                      {item.sources?.length > 5 && (
                        <span className="px-2 py-0.5 bg-gray-700/50 rounded text-xs text-gray-400">
                          +{item.sources.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Duplicate Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Spread Analysis */}
        {data.timeSpread && data.timeSpread.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Time Spread Distribution
              </h3>
              <InfoTooltip
                title="Time Spread"
                description="How long it takes for duplicate content to spread across sources."
              />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.timeSpread}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="timeRange"
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
                  dataKey="groups"
                  fill="#3B82F6"
                  name="Groups"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="avgDuplicates"
                  fill="#10B981"
                  name="Avg Duplicates"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Quality Correlation */}
        {data.qualityCorrelation && data.qualityCorrelation.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Duplicate vs Quality
              </h3>
              <InfoTooltip
                title="Quality Correlation"
                description="Relationship between duplicate count and article quality scores."
              />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.qualityCorrelation}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="duplicateLevel"
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
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
                  dataKey="avgScore"
                  fill="#8B5CF6"
                  name="Avg Score"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="avgHotness"
                  fill="#EC4899"
                  name="Avg Hotness"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Category & Source Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Category */}
        {data.byCategory && data.byCategory.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Duplicates by Category</h3>
              <InfoTooltip
                title="Category Breakdown"
                description="Duplicate distribution across different news categories."
              />
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {data.byCategory.slice(0, 10).map((cat, index) => (
                <div key={index} className="p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">
                      {cat.category}
                    </span>
                    <span className="px-2 py-1 bg-orange-500/10 border border-orange-500/30 rounded text-xs font-semibold text-orange-400">
                      {cat.totalDuplicates} total
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span>{cat.duplicateGroups} groups</span>
                    <span>Avg: {cat.avgDuplicates}</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                      style={{
                        width: `${
                          (cat.totalDuplicates /
                            data.byCategory[0].totalDuplicates) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source Network */}
        {data.sourceNetwork && data.sourceNetwork.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                Source Syndication Network
              </h3>
              <InfoTooltip
                title="Syndication Network"
                description="Sources that frequently share content with other publishers."
              />
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {data.sourceNetwork.slice(0, 10).map((source, index) => (
                <div key={index} className="p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium truncate flex-1">
                      {source.source}
                    </span>
                    <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs font-semibold text-cyan-400">
                      {source.uniquePartners} partners
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span>{source.sharedStories} shared stories</span>
                    <span>Index: {source.syndicationIndex}</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      style={{
                        width: `${
                          (source.syndicationIndex /
                            data.sourceNetwork[0].syndicationIndex) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
