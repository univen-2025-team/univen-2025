"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  value: string | number;
}

interface StockStatsProps {
  stats?: StatItem[];
  className?: string;
}

const defaultStats: StatItem[] = [
  { label: "Vốn hóa", value: "121,555,333" },
  { label: "Khối lượng giao dịch", value: "123,445,111" },
  { label: "Số lượng cổ phiếu lưu hành", value: "123,554" },
  { label: "P/E", value: "21,333" },
  { label: "EPS", value: "55,231" },
  { label: "P/B", value: "215,332" },
  { label: "Giá trị sổ sách", value: "123,111" },
  { label: "EV/EBITDA", value: "331,444" },
];

export function StockStats({ stats = defaultStats, className }: StockStatsProps) {
  const leftColumn = stats.slice(0, Math.ceil(stats.length / 2));
  const rightColumn = stats.slice(Math.ceil(stats.length / 2));

  return (
    <div className={cn("py-6 border-b", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {leftColumn.map((stat, index) => (
            <div
              key={index}
              className="flex items-center justify-between"
            >
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <span className="text-sm font-medium">{stat.value}</span>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {rightColumn.map((stat, index) => (
            <div
              key={index}
              className="flex items-center justify-between"
            >
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <span className="text-sm font-medium">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

