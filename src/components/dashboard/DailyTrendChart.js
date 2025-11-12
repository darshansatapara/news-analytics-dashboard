"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

export default function DailyTrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6">
        <p className="text-center text-gray-400 text-sm">
          No trend data available
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6"
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="truncate">Daily Article Trend</span>
        </h3>
        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 shrink-0" />
      </div>

      <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[300px]">
          <ResponsiveContainer width="100%" height={320} minWidth={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
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
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCount)"
                name="Articles"
              />
              <Area
                type="monotone"
                dataKey="avgScore"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorScore)"
                name="Avg Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
