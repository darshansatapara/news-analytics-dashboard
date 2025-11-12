"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MultiSelectDropdown({
  label,
  value = [],
  onChange,
  options = [],
  placeholder = "Select options",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionValue) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

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
        className="w-full flex items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg sm:rounded-xl hover:bg-gray-800/70 transition-all text-left min-h-[44px]"
      >
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((opt) => (
              <span
                key={opt.value}
                className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs sm:text-sm"
              >
                {opt.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(opt.value);
                  }}
                  className="hover:bg-blue-500/30 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-sm sm:text-base text-gray-400">
              {placeholder}
            </span>
          )}
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
                onClick={() => toggleOption(option.value)}
                className={`
                  w-full flex items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-left
                  transition-colors
                  ${
                    value.includes(option.value)
                      ? "bg-blue-500/20 text-blue-400"
                      : "hover:bg-gray-700/50 text-gray-300"
                  }
                `}
              >
                <span className="text-sm sm:text-base truncate">
                  {option.label}
                </span>
                {value.includes(option.value) && (
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
