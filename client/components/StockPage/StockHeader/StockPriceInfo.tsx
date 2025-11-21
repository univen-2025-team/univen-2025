"use client";

import * as React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface StockPriceInfoProps {
    currentPrice?: number;
    priceChange?: number;
    priceChangePercent?: number;
    lowPrice?: number;
    highPrice?: number;
    timeframe?: string;
    onTimeframeChange?: (timeframe: string) => void;
    className?: string;
}

export function StockPriceInfo({
    currentPrice = 103900,
    priceChange = 1200,
    priceChangePercent = 1.17,
    lowPrice = 215100,
    highPrice = 225100,
    timeframe = "24h",
    onTimeframeChange,
    className,
}: StockPriceInfoProps) {
    const isPositive = priceChange >= 0;
    const pricePosition =
        ((currentPrice - lowPrice) / (highPrice - lowPrice)) * 100;

    return (
        <div className={cn("flex flex-col space-y-4", className)}>
            <div className="flex flex-col">
                <div className="text-3xl font-bold">{currentPrice.toLocaleString()}</div>
                <div
                    className={cn(
                        "flex items-center gap-1 text-sm font-medium",
                        isPositive ? "text-green-500" : "text-red-500"
                    )}
                >
                    {isPositive ? (
                        <ArrowUp className="h-4 w-4" />
                    ) : (
                        <ArrowDown className="h-4 w-4" />
                    )}
                    <span>
                        {isPositive ? "+" : ""}
                        {priceChange.toLocaleString()} ({isPositive ? "+" : ""}
                        {priceChangePercent.toFixed(2)}%)
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Giá thấp nhất</span>
                    <span>{lowPrice.toLocaleString()}</span>
                </div>
                <div className="relative h-2 w-full rounded-full bg-muted">
                    <div
                        className="absolute h-full rounded-full bg-primary"
                        style={{ width: `${pricePosition}%` }}
                    />
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Giá cao nhất</span>
                    <span>{highPrice.toLocaleString()}</span>
                </div>
            </div>

            <Select value={timeframe} onValueChange={onTimeframeChange}>
                <SelectTrigger className="w-[100px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="24h">24h</SelectItem>
                    <SelectItem value="1w">1W</SelectItem>
                    <SelectItem value="1m">1M</SelectItem>
                    <SelectItem value="3m">3M</SelectItem>
                    <SelectItem value="6m">6M</SelectItem>
                    <SelectItem value="1y">1Y</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

