"use client";

import { HTMLAttributes } from "react";

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  className?: string;
}

export const Progress = ({
  value,
  max = 100,
  className = "",
  ...props
}: ProgressProps) => {
  // Ensure value is within bounds
  const percentage = Math.min(Math.max(value, 0), max);
  const widthPercent = (percentage / max) * 100;

  return (
    <div
      className={`w-full bg-gray-200 rounded-full h-2 overflow-hidden ${className}`}
      {...props}
    >
      <div
        className="bg-blue-600 h-full rounded-full transition-all duration-300"
        style={{ width: `${widthPercent}%` }}
      />
    </div>
  );
};