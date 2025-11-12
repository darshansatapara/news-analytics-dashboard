"use client";

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
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export default function CategoryChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6">
        <p className="text-center text-gray-400 text-sm">
          No category data available
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6"
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="truncate">Articles by Category</span>
        </h3>
        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
      </div>

      <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[300px]">
          <ResponsiveContainer width="100%" height={280} minWidth={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="category"
                stroke="#9CA3AF"
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
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
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Legend
                wrapperStyle={{
                  color: "#9CA3AF",
                  fontSize: "12px",
                  paddingTop: "10px",
                }}
              />
              <Bar
                dataKey="count"
                fill="#3B82F6"
                radius={[8, 8, 0, 0]}
                name="Articles"
              />
              <Bar
                dataKey="avgScore"
                fill="#8B5CF6"
                radius={[8, 8, 0, 0]}
                name="Avg Score"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
