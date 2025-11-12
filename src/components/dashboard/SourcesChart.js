"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";

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

export default function SourcesChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6">
        <p className="text-center text-gray-400 text-sm">
          No source data available
        </p>
      </div>
    );
  }

  const chartData = data.slice(0, 8).map((item) => ({
    name: item.source,
    value: item.count,
  }));

  // Custom label for mobile vs desktop
  const renderLabel = (entry) => {
    const percent = (
      (entry.value / chartData.reduce((acc, item) => acc + item.value, 0)) *
      100
    ).toFixed(0);
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

    if (isMobile) {
      return `${percent}%`;
    }
    return `${entry.name.substring(0, 12)}... ${percent}%`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6"
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <span className="truncate">Top News Sources</span>
        </h3>
        <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0" />
      </div>

      <div className="w-full overflow-x-auto">
        <ResponsiveContainer width="100%" height={300} minWidth={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={window.innerWidth < 640 ? 60 : 90}
              innerRadius={window.innerWidth < 640 ? 30 : 45}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
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
                color: "#fff",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Source Legend - Mobile Optimized */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-2">
          {chartData.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs text-gray-400 truncate">
                {entry.name}
              </span>
              <span className="text-xs text-gray-500 ml-auto shrink-0">
                ({entry.value})
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
