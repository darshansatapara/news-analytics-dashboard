"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dropdown({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select option",
  icon: Icon,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-400 mb-2">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg sm:rounded-xl hover:bg-gray-800/70 transition-all text-left"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {Icon && (
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0" />
          )}
          <span className="text-sm sm:text-base text-white truncate">
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg sm:rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-left
                  transition-colors
                  ${
                    value === option.value
                      ? "bg-blue-500/20 text-blue-400"
                      : "hover:bg-gray-700/50 text-gray-300"
                  }
                `}
              >
                <span className="text-sm sm:text-base truncate">
                  {option.label}
                </span>
                {value === option.value && (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
