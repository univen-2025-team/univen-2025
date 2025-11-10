"use client";

import * as React from "react";
import { StockSearchBar } from "./StockSearchBar";
import { StockHeader } from "./StockHeader";
import { StockStats } from "./StockStats";
import { StockAnalysis } from "./StockAnalysis";
import { StockChart } from "./StockChart";
import { StockActionPanel } from "./StockActionPanel";
import { cn } from "@/lib/utils";

interface StockPageProps {
  symbol?: string;
  onSymbolChange?: (symbol: string) => void;
  ticker?: string;
  exchange?: string;
  companyName?: string;
  description?: string;
  logoUrl?: string;
  currentPrice?: number;
  priceChange?: number;
  priceChangePercent?: number;
  lowPrice?: number;
  highPrice?: number;
  className?: string;
}

export function StockPage({
  symbol = "FPT",
  onSymbolChange,
  ticker = "FPT",
  exchange = "HOSE",
  companyName = "FPT Corp. – Công ty Cổ phần FPT",
  description = "Tập đoàn FPT (HOSE: FPT) là doanh nghiệp hàng đầu Việt Nam trong lĩnh vực công nghệ, viễn thông và giáo dục. FPT hoạt động trên 3 mảng chính: Công nghệ (tư vấn, chuyển đổi số, phần mềm), Viễn thông (Internet, hạ tầng số) và Giáo dục (đào tạo nhân lực ...",
  logoUrl,
  currentPrice = 103900,
  priceChange = 1200,
  priceChangePercent = 1.17,
  lowPrice = 215100,
  highPrice = 225100,
  className,
}: StockPageProps) {
  const [timeframe, setTimeframe] = React.useState("24h");

  return (
    <div className={cn("w-full min-h-screen bg-background p-4 md:p-6 space-y-6", className)}>
      <StockSearchBar symbol={symbol} onSymbolChange={onSymbolChange} />
      
      <StockHeader
        ticker={ticker}
        exchange={exchange}
        companyName={companyName}
        description={description}
        logoUrl={logoUrl}
        currentPrice={currentPrice}
        priceChange={priceChange}
        priceChangePercent={priceChangePercent}
        lowPrice={lowPrice}
        highPrice={highPrice}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
      />

      <StockStats />

      <StockAnalysis />

      <StockChart
        symbol={symbol}
        companyName={companyName}
        exchange={exchange}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
      />

      <StockActionPanel />
    </div>
  );
}

