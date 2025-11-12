"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Info, TrendingUp, TrendingDown } from "lucide-react";
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

export default function CategoriesTab({ timeRange }) {
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

      const response = await fetch(
        `/api/analytics?type=categories&range=${timeRange}`,
        {
          signal: controller.signal,
        }
      );

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
      console.error("Error fetching categories:", error);
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
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading category analytics...</p>
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
            Failed to load category analytics
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {error || "Unknown error"}
          </p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Growth Leaders */}
      {data.growth && data.growth.length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Category Growth</h3>
            <InfoTooltip
              title="Category Growth"
              description="Period-over-period growth comparison for each category."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.growth.slice(0, 6).map((cat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium capitalize">
                    {cat.category}
                  </span>
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                      cat.growth > 0
                        ? "bg-green-500/10 text-green-400"
                        : cat.growth < 0
                        ? "bg-red-500/10 text-red-400"
                        : "bg-gray-500/10 text-gray-400"
                    }`}
                  >
                    {cat.growth > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {cat.growth > 0 ? "+" : ""}
                    {cat.growth}%
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Current: {cat.current}</span>
                  <span>Previous: {cat.previous}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Category Engagement & Quality Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement by Category */}
        {data.engagement && data.engagement.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Engagement by Category</h3>
              <InfoTooltip
                title="Category Engagement"
                description="Total views and average engagement per article by category."
              />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.engagement.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="category"
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
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
                <Bar dataKey="totalViews" fill="#3B82F6" name="Total Views" />
                <Bar dataKey="avgViews" fill="#10B981" name="Avg Views" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Quality by Category */}
        {data.quality && data.quality.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Quality by Category</h3>
              <InfoTooltip
                title="Quality Metrics"
                description="Average score and quality rate (% of high-quality articles) by category."
              />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.quality.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="category"
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
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
                <Bar dataKey="avgScore" fill="#8B5CF6" name="Avg Score" />
                <Bar
                  dataKey="qualityRate"
                  fill="#EC4899"
                  name="Quality Rate %"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Duplicate Analysis & Source Diversity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Duplicates by Category */}
        {data.duplicates && data.duplicates.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Duplicates by Category</h3>
              <InfoTooltip
                title="Content Duplication"
                description="Number of duplicate content groups found in each category."
              />
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {data?.duplicates.slice(0, 10).map((dup, index) => (
                <div key={index} className="p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium capitalize">
                      {dup?.category}
                    </span>
                    <span className="px-2 py-1 bg-orange-500/10 border border-orange-500/30 rounded text-xs font-semibold text-orange-400">
                      {dup?.duplicateGroups} groups
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{dup?.totalDuplicates} total duplicates</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source Diversity */}
        {data.sourceDiversity && data.sourceDiversity.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Source Diversity</h3>
              <InfoTooltip
                title="Source Diversity"
                description="Number of unique sources publishing in each category."
              />
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {data.sourceDiversity.slice(0, 10).map((item, index) => (
                <div key={index} className="p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">
                      {item.category}
                    </span>
                    <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-xs font-semibold text-blue-400">
                      {item.uniqueSources} sources
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{
                        width: `${Math.min(
                          (item.uniqueSources /
                            data.sourceDiversity[0].uniqueSources) *
                            100,
                          100
                        )}%`,
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
