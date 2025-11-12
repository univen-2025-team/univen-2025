"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AnalysisItem {
  label: string;
  value: string;
  status: "positive" | "negative" | "neutral";
  showDetails?: boolean;
  onDetailsClick?: () => void;
}

interface StockAnalysisProps {
  items?: AnalysisItem[];
  className?: string;
}

const defaultItems: AnalysisItem[] = [
  {
    label: "Phân tích cơ bản",
    value: "Không ổn định",
    status: "negative",
  },
  {
    label: "Định giá",
    value: "Không hấp dẫn",
    status: "negative",
    showDetails: true,
  },
  {
    label: "Rủi ro",
    value: "Trung bình",
    status: "neutral",
  },
];

export function StockAnalysis({
  items = defaultItems,
  className,
}: StockAnalysisProps) {
  const getStatusColor = (status: AnalysisItem["status"]) => {
    switch (status) {
      case "positive":
        return "text-green-500";
      case "negative":
        return "text-red-500";
      case "neutral":
        return "text-yellow-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className={cn("py-6 border-b", className)}>
      <div className="flex flex-wrap gap-6">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{item.label}:</span>
            <span className={cn("text-sm font-medium", getStatusColor(item.status))}>
              {item.value}
            </span>
            {item.showDetails && (
              <button
                onClick={item.onDetailsClick}
                className="text-sm text-primary hover:underline"
              >
                Chi tiết &gt;
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

