"use client";

import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TimeRangeSelector({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const ranges = [
    { label: "24 Hours", shortLabel: "24h", value: "24h" },
    { label: "7 Days", shortLabel: "7d", value: "7d" },
    { label: "30 Days", shortLabel: "30d", value: "30d" },
    { label: "All Time", shortLabel: "All", value: "all" },
  ];

  const selectedRange = ranges.find((r) => r.value === value);

  // Desktop: Inline buttons
  return (
    <>
      {/* Desktop Version - Hidden on mobile */}
      <div className="hidden sm:flex gap-2 bg-gray-800/50 p-1 rounded-xl border border-gray-700/50">
        {ranges.map((range) => (
          <button
            key={range.value}
            onClick={() => onChange(range.value)}
            className={`
              px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200
              ${
                value === range.value
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }
            `}
          >
            <span className="hidden md:inline">{range.label}</span>
            <span className="md:hidden">{range.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Mobile Version - Dropdown */}
      <div className="sm:hidden relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between gap-2 w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-800/70 transition-all"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-white">
              {selectedRange?.label}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />

              {/* Dropdown */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50"
              >
                {ranges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => {
                      onChange(range.value);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 text-left transition-colors
                      ${
                        value === range.value
                          ? "bg-blue-500/20 text-blue-400"
                          : "hover:bg-gray-700/50 text-gray-300"
                      }
                    `}
                  >
                    <span className="text-sm font-medium">{range.label}</span>
                    {value === range.value && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    )}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
