"use client";

import * as React from "react";
import { StockTitle } from "./StockTitle";
import { StockPriceInfo } from "./StockPriceInfo";
import { cn } from "@/lib/utils";

interface StockHeaderProps {
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
    timeframe?: string;
    onTimeframeChange?: (timeframe: string) => void;
    className?: string;
}

export function StockHeader({
    ticker,
    exchange,
    companyName,
    description,
    logoUrl,
    currentPrice,
    priceChange,
    priceChangePercent,
    lowPrice,
    highPrice,
    timeframe,
    onTimeframeChange,
    className,
}: StockHeaderProps) {
    return (
        <div
            className={cn(
                "flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-6 border-b",
                className
            )}
        >
            <div className="flex-1">
                <StockTitle
                    ticker={ticker}
                    exchange={exchange}
                    companyName={companyName}
                    description={description}
                    logoUrl={logoUrl}
                />
            </div>
            <div className="md:w-80">
                <StockPriceInfo
                    currentPrice={currentPrice}
                    priceChange={priceChange}
                    priceChangePercent={priceChangePercent}
                    lowPrice={lowPrice}
                    highPrice={highPrice}
                    timeframe={timeframe}
                    onTimeframeChange={onTimeframeChange}
                />
            </div>
        </div>
    );
}

