"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import CandlestickChart from "@/components/ui/CandlestickChart";

interface StockChartProps {
  symbol?: string;
  companyName?: string;
  exchange?: string;
  timeframe?: string;
  onTimeframeChange?: (timeframe: string) => void;
  className?: string;
}

type CandleData = {
  timestamp: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

const timeframes = ["1D", "5D", "1M", "3M", "6M", "1Y", "5Y", "All"];

// Format number with thousand separators
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

// Format volume
const formatVolume = (volume?: number): string => {
  if (!volume) return "0";
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(2)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(2)}K`;
  }
  return formatNumber(volume);
};

export function StockChart({
  symbol = "FPT",
  companyName = "FPT Corp.",
  exchange = "HOSE",
  timeframe = "1D",
  onTimeframeChange,
  className,
}: StockChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = React.useState(timeframe);
  const [latestCandle, setLatestCandle] = React.useState<CandleData | null>(null);

  const handleTimeframeClick = (tf: string) => {
    setSelectedTimeframe(tf);
    onTimeframeChange?.(tf);
  };

  const handleDataLoad = (candle: CandleData | null) => {
    setLatestCandle(candle);
  };

  // Calculate change and percentage
  const change = latestCandle ? latestCandle.close - latestCandle.open : 0;
  const changePercent = latestCandle && latestCandle.open !== 0
    ? ((change / latestCandle.open) * 100).toFixed(2)
    : "0.00";
  const isPositive = change >= 0;

  return (
    <div className={cn("py-6 space-y-4", className)}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Q VIC"
            className="px-2 py-1 text-sm border rounded bg-background"
          />
        </div>
        <div className="text-sm">
          <div className="font-medium">
            {companyName} · {selectedTimeframe} · {exchange}
          </div>
          <div className="text-muted-foreground">
            Khối lượng {latestCandle?.volume ? formatVolume(latestCandle.volume) : "0"}
          </div>
        </div>
      </div>

      {/* OHLC Header */}
      {latestCandle && (
        <div className="flex items-center justify-between gap-4 p-3 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">O: </span>
              <span className="font-medium">{formatNumber(latestCandle.open)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">H: </span>
              <span className="font-medium">{formatNumber(latestCandle.high)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">L: </span>
              <span className="font-medium">{formatNumber(latestCandle.low)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">C: </span>
              <span className="font-medium">{formatNumber(latestCandle.close)}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className={cn(
                "font-medium",
                isPositive ? "text-green-600" : "text-red-600"
              )}>
                {isPositive ? "+" : ""}{formatNumber(change)} ({isPositive ? "+" : ""}{changePercent}%)
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="w-full">
        <CandlestickChart symbol={symbol} onDataLoad={handleDataLoad} />
      </div>

      <div className="flex flex-wrap gap-2">
        {timeframes.map((tf) => (
          <Button
            key={tf}
            variant={selectedTimeframe === tf ? "default" : "outline"}
            size="sm"
            onClick={() => handleTimeframeClick(tf)}
            className="text-xs"
          >
            {tf}
          </Button>
        ))}
      </div>

      <div className="flex justify-end text-xs text-muted-foreground">
        <div>
          <div>22:45:59 UTC+7</div>
          <div>log tự động</div>
        </div>
      </div>
    </div>
  );
}

