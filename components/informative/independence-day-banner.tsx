"use client";

import { Sparkles, X } from "lucide-react";
import { useState } from "react";

// Zero-hydration Mismatch 24-Spoke Ashok Chakra SVG Component
export function AshokChakra({
  className = "w-6 h-6",
  size = 100,
}: {
  className?: string;
  size?: number;
}) {
  const radius = size / 2;
  const outerRadius = radius * 0.88;
  const innerRadius = radius * 0.18;
  const spokeCount = 24;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-label="Ashok Chakra"
      role="img"
    >
      {/* Outer Circle */}
      <circle
        cx={radius}
        cy={radius}
        r={outerRadius}
        fill="none"
        stroke="#000080"
        strokeWidth={size * 0.05}
      />
      {/* Inner Hub Ring */}
      <circle cx={radius} cy={radius} r={innerRadius} fill="#000080" />

      {/* 24 Radial Spokes using deterministic integer rotate transform */}
      {Array.from({ length: spokeCount }).map((_, i) => (
        <line
          key={`chakra-spoke-${i * 15}`}
          x1={radius}
          y1={radius}
          x2={radius}
          y2={radius - outerRadius}
          stroke="#000080"
          strokeWidth={size * 0.025}
          strokeLinecap="round"
          transform={`rotate(${i * 15}, ${radius}, ${radius})`}
        />
      ))}

      {/* 24 Decorative Outer Rim Points */}
      {Array.from({ length: spokeCount }).map((_, i) => (
        <circle
          key={`chakra-tip-${i * 15}`}
          cx={radius}
          cy={radius - outerRadius * 0.95}
          r={size * 0.015}
          fill="#000080"
          transform={`rotate(${i * 15 + 7.5}, ${radius}, ${radius})`}
        />
      ))}
    </svg>
  );
}

// Zero-hydration Mismatch Indian Flag SVG Component
export function IndianFlag({ className = "w-10 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 90 60"
      className={`${className} shadow-sm rounded border border-slate-200 overflow-hidden shrink-0`}
      aria-label="Indian National Flag"
      role="img"
    >
      {/* Saffron Stripe */}
      <rect x="0" y="0" width="90" height="20" fill="#FF9933" />
      {/* White Stripe */}
      <rect x="0" y="20" width="90" height="20" fill="#FFFFFF" />
      {/* Green Stripe */}
      <rect x="0" y="40" width="90" height="20" fill="#138808" />
      {/* Ashok Chakra in Center */}
      <g transform="translate(45, 30)">
        <circle
          cx="0"
          cy="0"
          r="9"
          fill="none"
          stroke="#000080"
          strokeWidth="0.8"
        />
        <circle cx="0" cy="0" r="1.8" fill="#000080" />
        {Array.from({ length: 24 }).map((_, i) => (
          <line
            key={`flag-spoke-${i * 15}`}
            x1="0"
            y1="0"
            x2="0"
            y2="-9"
            stroke="#000080"
            strokeWidth="0.5"
            transform={`rotate(${i * 15})`}
          />
        ))}
      </g>
    </svg>
  );
}

export function IndependenceDayBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="relative z-30 bg-gradient-to-r from-orange-50/70 via-white to-emerald-50/70 border-b border-amber-200/60 shadow-sm transition-all duration-300">
      {/* Tricolor Top Line */}
      <div className="h-1 bg-gradient-to-r from-[#FF9933] via-amber-300 to-[#138808]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-800">
        {/* Left Side: Flag + Chakra + Text */}
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="relative shrink-0 hidden sm:block">
            <IndianFlag className="w-12 h-8" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <IndianFlag className="w-6 h-4 sm:hidden" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase tracking-wider">
                <AshokChakra className="w-3 h-3 animate-[spin_18s_linear_infinite]" />
                15th August 2026 • 80th Independence Day
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-1.5">
              <span>Happy Independence Day!</span>
              <span>🇮🇳</span>
            </h3>

            <p className="text-xs text-slate-600 font-normal leading-normal">
              Wishing all students, faculty, and staff a glorious Independence
              Day. Saluting the spirit of freedom and knowledge.
            </p>
          </div>
        </div>

        {/* Right Side: Badge + Close */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Jai Hind! 🇮🇳</span>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            aria-label="Close Independence Day Banner"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
